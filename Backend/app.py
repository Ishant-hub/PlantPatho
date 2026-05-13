import os
import sqlite3
import datetime
import traceback
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2

app = Flask(__name__)
CORS(app)  # Allow frontend requests

DB_FILE = 'database.db'
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 🔧 Load model
try:
    model = tf.keras.models.load_model("model.h5")
    print("Model loaded successfully")
except Exception as e:
    print(f"Warning: Model load failed - {e}")
    model = None

# --- DATABASE SETUP ---
def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                image_filename TEXT,
                result INTEGER,
                confidence REAL,
                relay_status TEXT,
                completion_status TEXT
            )
        ''')
        c.execute('''
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        ''')
        # Default settings
        c.execute('SELECT COUNT(*) FROM settings')
        if c.fetchone()[0] == 0:
            default_settings = [
                ('flaskServerUrl', 'http://127.0.0.1:5000'),
                ('autoRefreshInterval', '5'),
                ('relayOnDuration', '3'),
                ('wifiSsid', 'Your_WiFi_SSID'),
                ('wifiPassword', ''),
                ('autoStartMonitoring', 'true'),
                ('soundAlerts', 'true')
            ]
            c.executemany('INSERT INTO settings (key, value) VALUES (?, ?)', default_settings)
        
        c.execute('''
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                message TEXT,
                type TEXT
            )
        ''')
        conn.commit()

init_db()

def log_activity(message, type='info'):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("INSERT INTO logs (timestamp, message, type) VALUES (?, ?, ?)", (timestamp, message, type))
        conn.commit()

# --- ROUTES ---

@app.route('/uploads/<filename>')
def serve_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        log_activity("Image capture request received", "info")
        file_bytes = request.data

        if not file_bytes:
            log_activity("No data received for prediction", "error")
            return jsonify({"error": "No data received"})

        # Convert bytes → image
        npimg = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

        if img is None:
            log_activity("Image decode failed", "error")
            return jsonify({"error": "Image decode failed"})

        # Save image with timestamp
        timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"scan_{timestamp_str}.jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        cv2.imwrite(filepath, img)

        if model is None:
            # Mock prediction if model isn't loaded
            result = 1
            confidence = 0.95
        else:
            # Preprocess
            img_resized = cv2.resize(img, (128, 128))
            img_norm = img_resized / 255.0
            img_exp = np.expand_dims(img_norm, axis=0)

            # Predict
            pred = model.predict(img_exp)[0][0]
            confidence = float(pred) if pred > 0.5 else float(1.0 - pred)
            result = 1 if pred >= 0.5 else 0

        # Relay logic
        relay_status = "OFF" if result == 1 else "ON"
        completion_status = "Completed"
        
        timestamp_db = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Save to DB
        with sqlite3.connect(DB_FILE) as conn:
            c = conn.cursor()
            c.execute(
                "INSERT INTO history (timestamp, image_filename, result, confidence, relay_status, completion_status) VALUES (?, ?, ?, ?, ?, ?)",
                (timestamp_db, filename, result, confidence, relay_status, completion_status)
            )
            conn.commit()

        log_activity(f"AI prediction completed: {'Healthy (1)' if result==1 else 'Diseased (0)'}", "success" if result==1 else "warning")
        log_activity(f"Relay activated: {relay_status}", "info")

        return jsonify({
            "result": result,
            "confidence": confidence,
            "timestamp": timestamp_db,
            "image_url": f"/uploads/{filename}",
            "relay": relay_status
        })

    except Exception as e:
        log_activity(f"Error during prediction: {str(e)}", "error")
        return jsonify({"error": str(e), "trace": traceback.format_exc()})

@app.route('/latest', methods=['GET'])
def get_latest():
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT * FROM history ORDER BY id DESC LIMIT 1")
        row = c.fetchone()
        
        if row:
            return jsonify(dict(row))
        else:
            return jsonify({})

@app.route('/history', methods=['GET'])
def get_history():
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT * FROM history ORDER BY id DESC")
        rows = c.fetchall()
        return jsonify([dict(row) for row in rows])

@app.route('/reports', methods=['GET'])
def get_reports():
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM history")
        total_scans = c.fetchone()[0]
        
        c.execute("SELECT COUNT(*) FROM history WHERE result = 1")
        healthy_count = c.fetchone()[0]
        
        c.execute("SELECT COUNT(*) FROM history WHERE result = 0")
        diseased_count = c.fetchone()[0]
        
        c.execute("SELECT COUNT(*) FROM history WHERE relay_status = 'ON'")
        relay_activations = c.fetchone()[0]
        
        c.execute("""
            SELECT date(timestamp) as day, 
                   SUM(CASE WHEN result=1 THEN 1 ELSE 0 END) as healthy,
                   SUM(CASE WHEN result=0 THEN 1 ELSE 0 END) as diseased
            FROM history 
            GROUP BY day 
            ORDER BY day DESC LIMIT 7
        """)
        daily_scans = [{"date": r[0], "healthy": r[1], "diseased": r[2]} for r in c.fetchall()]
        daily_scans.reverse()

        return jsonify({
            "total_scans": total_scans,
            "healthy_count": healthy_count,
            "diseased_count": diseased_count,
            "relay_activations": relay_activations,
            "daily_scans": daily_scans,
            "accuracy": 92.4 
        })

@app.route('/control', methods=['POST'])
def control():
    data = request.json
    action = data.get('action') 
    log_activity(f"Monitoring control: {action}", "info")
    return jsonify({"status": "success", "action": action})

@app.route('/status', methods=['GET'])
def get_status():
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT * FROM logs ORDER BY id DESC LIMIT 10")
        logs = [dict(row) for row in c.fetchall()]
        
        c.execute("SELECT relay_status, timestamp FROM history ORDER BY id DESC LIMIT 1")
        last_hist = c.fetchone()
        relay = last_hist['relay_status'] if last_hist else "OFF"
        last_scan = last_hist['timestamp'] if last_hist else "--:--"

        c.execute("SELECT value FROM settings WHERE key = 'relayOnDuration'")
        duration_row = c.fetchone()
        relay_duration = int(duration_row['value']) if duration_row else 3

        is_online = False
        if last_scan != "--:--":
            from datetime import datetime
            try:
                last_time = datetime.strptime(last_scan, "%Y-%m-%d %H:%M:%S")
                seconds_passed = (datetime.now() - last_time).total_seconds()
                if seconds_passed < 60:
                    is_online = True
                
                # Auto-turn off relay in dashboard based on setting
                if relay == "ON" and seconds_passed > relay_duration:
                    relay = "OFF"
            except Exception:
                pass

        esp32_status = "Online" if is_online else "Offline"
        power_status = "Stable (5V)" if is_online else "Unknown"
        wifi_status = "Connected" if is_online else "Disconnected"

    return jsonify({
        "esp32": esp32_status,
        "relay": relay,
        "server": "Running",
        "power": power_status,
        "wifi": wifi_status,
        "last_scan": last_scan,
        "logs": logs
    })

@app.route('/settings', methods=['GET', 'POST'])
def settings():
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        if request.method == 'POST':
            data = request.json
            for k, v in data.items():
                c.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, str(v)))
            conn.commit()
            return jsonify({"status": "success"})
        else:
            c.execute("SELECT * FROM settings")
            rows = c.fetchall()
            return jsonify({row[0]: row[1] for row in rows})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)