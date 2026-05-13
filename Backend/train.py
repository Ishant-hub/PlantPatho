import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# SETTINGS
IMG_SIZE = (128, 128)
BATCH_SIZE = 32
EPOCHS = 25   # 🔥 increased for better learning

# DATASET PATH
DATASET_PATH = r"C:\Users\ISHANT\OneDrive\Desktop\ChatgptIP\PlantVillage"

# DATA AUGMENTATION
datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2,
    rotation_range=25,
    zoom_range=0.3,
    horizontal_flip=True,
    brightness_range=[0.6, 1.4]
)

# LOAD DATA
train_data = datagen.flow_from_directory(
    DATASET_PATH,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='binary',
    subset='training'
)

val_data = datagen.flow_from_directory(
    DATASET_PATH,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='binary',
    subset='validation'
)

# 🔥 PRINT CLASS MAPPING (VERY IMPORTANT)
print("Class mapping:", train_data.class_indices)

# MODEL
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(128,128,3),
    include_top=False,
    weights='imagenet'
)

# FINE-TUNING (more stable)
base_model.trainable = True
for layer in base_model.layers[:-50]:   # 🔥 freeze more layers
    layer.trainable = False

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(1, activation='sigmoid')
])

# 🔥 BETTER OPTIMIZER
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
    loss='binary_crossentropy',
    metrics=['accuracy']
)

# TRAIN
history = model.fit(
    train_data,
    validation_data=val_data,
    epochs=EPOCHS
)

# SAVE MODEL
model.save("model.h5")

print("✅ Training complete. Model saved as model.h5")