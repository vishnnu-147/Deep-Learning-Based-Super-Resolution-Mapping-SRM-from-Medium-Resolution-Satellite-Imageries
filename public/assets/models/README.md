# TensorFlow.js Super-Resolution Model Target

To deploy a custom-trained deep learning super-resolution model into this platform:

1. **Model Architecture**:
   - Multispectral Residual CNN (or SRCNN / RCAN adapted for satellite bands).
   - Expected Input: 4-band Sentinel-2 Level-2A reflectance matrix:
     `[Batch, Height, Width, 4]` corresponding to bands `B04 (Red)`, `B03 (Green)`, `B02 (Blue)`, and `B08 (NIR)`.
   - Scale factor: 4× spatial upscaling.
   - Expected Output: `[Batch, 4*Height, 4*Width, 4]` (or `[Batch, 4*Height, 4*Width, 3]` for RGB).

2. **File Conversion**:
   Convert your trained Keras/PyTorch/SavedModel using `tensorflowjs_converter`:
   ```bash
   tensorflowjs_converter --input_format=tf_saved_model --output_format=tfjs_graph_model ./saved_model ./public/assets/models/
   ```

3. **Required Files**:
   - `model.json`
   - `group1-shard1of1.bin` (and any other weight binary shards)

4. **Runtime Activation**:
   When `model.json` is detected at `assets/models/model.json`, the application automatically loads it via `@tensorflow/tfjs`, validates its input/output shapes dynamically, and updates the UI status to **"AI Super Resolution"** (State A).
