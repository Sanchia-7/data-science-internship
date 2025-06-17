"""
Python script to integrate your model.pkl with the Next.js application.

To use your actual model.pkl file, you have several options:

1. **Python API Service**: Create a separate Python service that loads your model
2. **Convert to ONNX**: Convert your pickle model to ONNX format for JavaScript
3. **Serverless Functions**: Use Vercel's Python runtime for serverless functions

Here's how you can create a Python API service:
"""

import pickle
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load your trained model
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    print("Model loaded successfully!")
except FileNotFoundError:
    print("model.pkl not found. Please ensure the file is in the correct location.")
    model = None

@app.route('/predict', methods=['POST'])
def predict_price():
    try:
        data = request.json
        specs = data['laptopSpecs']
        
        # Convert specs to the format your model expects
        # Adjust these features based on your model's training features
        features = np.array([[
            specs.get('ram', 8),
            specs.get('storage', 256),
            specs.get('inches', 14),
            specs.get('cpu_freq', 2.5),
            specs.get('weight', 1.5),
            1 if specs.get('touchscreen', False) else 0,
            1 if specs.get('ips', False) else 0,
            1 if specs.get('retina', False) else 0,
            # Add more features as needed based on your model
        ]])
        
        if model is not None:
            prediction = model.predict(features)[0]
            
            # If your model predicts log prices, convert back
            # prediction = np.exp(prediction)  # Uncomment if needed
            
            return jsonify({
                'success': True,
                'predictedPrice': float(prediction),
                'confidence': 0.85  # You can calculate this based on your model
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

"""
To run this service:
1. Save this as app.py
2. Install dependencies: pip install flask flask-cors numpy scikit-learn
3. Place your model.pkl in the same directory
4. Run: python app.py
5. Update the fetch URL in the Next.js app to http://localhost:5000/predict
"""
