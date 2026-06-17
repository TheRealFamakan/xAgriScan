"""
xAgriScan Backend - Flask API for Apple Leaf Disease Detection
Uses a fine-tuned ResNet-50 model to classify apple leaf images into 6 categories.
"""
from advice_service import get_disease_advice
import os
import io
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

app = Flask(__name__)
CORS(app)

# Classes in the exact order used during training (alphabetical from ImageFolder)
CLASS_NAMES = [
    "apple_frogeye_leaf_spot",
    "apple_leaf_healthy",
    "apple_mosaic_leaf",
    "apple_powdery_mildew_leaf",
    "apple_rust_leaf",
    "apple_scab_leaf",
]

# Human-readable labels (French)
CLASS_LABELS_FR = {
    "apple_frogeye_leaf_spot": "Tache oculaire (Frogeye Leaf Spot)",
    "apple_leaf_healthy": "Feuille saine",
    "apple_mosaic_leaf": "Mosaique du pommier",
    "apple_powdery_mildew_leaf": "Oidium (Powdery Mildew)",
    "apple_rust_leaf": "Rouille (Apple Rust)",
    "apple_scab_leaf": "Tavelure (Apple Scab)",
}

# Severity information
CLASS_SEVERITY = {
    "apple_frogeye_leaf_spot": "moderate",
    "apple_leaf_healthy": "none",
    "apple_mosaic_leaf": "low",
    "apple_powdery_mildew_leaf": "high",
    "apple_rust_leaf": "moderate",
    "apple_scab_leaf": "high",
}

NUM_CLASSES = 6

# Image transforms – must match what was used during training/validation
inference_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

def load_model():
    """Load the fine-tuned ResNet-50 model."""
    model = models.resnet50(weights=None)

    # Reproduce the exact architecture from the notebook
    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.5),
        nn.Linear(num_ftrs, NUM_CLASSES),
    )

    # Path to saved weights
    model_path = os.path.join(os.path.dirname(__file__), "..", "models", "resnet50_xagriscan.pth")
    model_path = os.path.abspath(model_path)

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model weights not found at {model_path}. "
            "Please ensure 'resnet50_xagriscan.pth' is in the models/ directory."
        )

    model.load_state_dict(torch.load(model_path, map_location=device))
    model = model.to(device)
    model.eval()
    print(f"Model loaded successfully from {model_path} (device: {device})")
    return model


model = load_model()

# ---------------------------------------------------------------------------
# Prediction helpers
# ---------------------------------------------------------------------------

def predict_image(image_bytes: bytes) -> dict:
    """Run prediction on a single image and return results."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = inference_transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]

    confidence, predicted_idx = torch.max(probabilities, 0)
    predicted_class = CLASS_NAMES[predicted_idx.item()]

    # Build per-class probabilities
    class_probabilities = {}
    for i, cls in enumerate(CLASS_NAMES):
        class_probabilities[cls] = {
            "probability": round(probabilities[i].item() * 100, 2),
            "label": CLASS_LABELS_FR[cls],
        }

    return {
        "predicted_class": predicted_class,
        "predicted_label": CLASS_LABELS_FR[predicted_class],
        "confidence": round(confidence.item() * 100, 2),
        "severity": CLASS_SEVERITY[predicted_class],
        "is_healthy": predicted_class == "apple_leaf_healthy",
        "class_probabilities": class_probabilities,
        "advice": get_disease_advice(
            predicted_class,
            CLASS_LABELS_FR[predicted_class],
            CLASS_SEVERITY[predicted_class],
        ),
    }

# ---------------------------------------------------------------------------
# API Routes
# ---------------------------------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "model": "ResNet-50 (xAgriScan)", "device": str(device)})


@app.route("/api/predict", methods=["POST"])
def predict():
    """Predict disease from a single uploaded image."""
    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Use 'image' as the form field name."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    try:
        image_bytes = file.read()
        result = predict_image(image_bytes)
        result["filename"] = file.filename
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


@app.route("/api/predict/batch", methods=["POST"])
def predict_batch():
    """Predict disease from multiple uploaded images."""
    files = request.files.getlist("images")
    if not files:
        return jsonify({"error": "No image files provided. Use 'images' as the form field name."}), 400

    results = []
    for file in files:
        if file.filename == "":
            continue
        try:
            image_bytes = file.read()
            result = predict_image(image_bytes)
            result["filename"] = file.filename
            results.append(result)
        except Exception as e:
            results.append({"filename": file.filename, "error": str(e)})

    # Summary statistics
    total = len(results)
    healthy = sum(1 for r in results if r.get("is_healthy", False))
    diseased = total - healthy

    return jsonify({
        "results": results,
        "summary": {
            "total": total,
            "healthy": healthy,
            "diseased": diseased,
            "health_rate": round(healthy / total * 100, 2) if total > 0 else 0,
        },
    })


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)