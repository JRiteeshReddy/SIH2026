import sys
import types

# Mock problematic submodules before importing tensorflowjs
jax_mock = types.ModuleType('tensorflowjs.converters.jax_conversion')
jax_mock.convert_jax = lambda *args, **kwargs: None
sys.modules['tensorflowjs.converters.jax_conversion'] = jax_mock

saved_mock = types.ModuleType('tensorflowjs.converters.tf_saved_model_conversion_v2')
saved_mock.convert_tf_saved_model = lambda *args, **kwargs: None
saved_mock.load_and_save_keras_model = lambda *args, **kwargs: None
sys.modules['tensorflowjs.converters.tf_saved_model_conversion_v2'] = saved_mock

tf_ds_mock = types.ModuleType('tensorflow_decision_forests')
sys.modules['tensorflow_decision_forests'] = tf_ds_mock

import tf_keras as keras
from tensorflowjs.converters import keras_h5_conversion

h5_path = 'public/model/keras_model.h5'
out_dir = 'public/model/tfjs'

print(f"Loading model from {h5_path}...")
model = keras.models.load_model(h5_path, compile=False)
print("Input shape:", model.input_shape)
print("Output shape:", model.output_shape)

print(f"Saving TensorFlow.js model to {out_dir}...")
keras_h5_conversion.save_keras_model(model, out_dir)
print("SUCCESS: TensorFlow.js model saved!")
