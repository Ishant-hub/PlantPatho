import tensorflow as tf
import cv2
import numpy as np
import os

# PATHS
MODEL_PATH = r"C:\Users\ISHANT\OneDrive\Desktop\ChatgptIP\model.h5"
IMAGE_PATH = r"C:\Users\ISHANT\OneDrive\Desktop\ChatgptIP\test.jpg"

# LOAD MODEL
print("Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)

# CHECK IMAGE
if not os.path.exists(IMAGE_PATH):
    print("❌ Image not found")
    exit()

img = cv2.imread(IMAGE_PATH)

if img is None:
    print("❌ Failed to load image")
    exit()

# PREPROCESS
img = cv2.resize(img, (128, 128))
img = img / 255.0
img = np.expand_dims(img, axis=0)

# PREDICT
pred = model.predict(img)[0][0]

print(f"Prediction score: {pred:.4f}")

# 🔥 UPDATED THRESHOLD
if pred > 0.5:
    print("🌱 Result: Healthy")
else:
    print("🌿 Result: Diseased")