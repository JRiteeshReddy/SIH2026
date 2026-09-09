import os
import tensorflow as tf
from tensorflowjs.converters import keras_h5_conversion

h5_file = 'public/model/keras_model.h5'
output_dir = 'public/model/tfjs'

os.makedirs(output_dir, exist_ok=True)
print(f"Loading Keras model from {h5_file}...")
model = tf.keras.models.load_model(h5_file, compile=False)
print("Input shape:", model.input_shape)
print("Output shape:", model.output_shape)

print(f"Converting model to TF.js format at {output_dir}...")
keras_h5_conversion.save_keras_model(model, output_dir)
print("Conversion successfully completed!")
