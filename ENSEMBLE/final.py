import torch
import cv2
import numpy as np

from models.cnn_conjuctiva import get_model as get_conj_model
from models.cnn_palm import get_model as get_palm_model
from models.cnn_nails import get_model as get_nails_model


# ---------------------------
# Configuration
# ---------------------------
IMG_SIZE = 224
device = torch.device("cpu")

# Ensemble weights (recall-focused)
W_CONJ = 0.45
W_PALM = 0.35
W_NAILS = 0.20

# Decision threshold
THRESHOLD = 0.48


# ---------------------------
# Image preprocessing (same as training, minimal)
# ---------------------------
def load_image(path):
    img = cv2.imread(path)
    if img is None:
        raise ValueError(f"Cannot read image: {path}")

    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img / 255.0

    img = torch.tensor(img, dtype=torch.float32)
    img = img.permute(2, 0, 1).unsqueeze(0)  # (1, 3, H, W)
    return img


# ---------------------------
# Load trained models
# ---------------------------
def load_models():
    conj_model = get_conj_model(pretrained=False)
    palm_model = get_palm_model(pretrained=False)
    nails_model = get_nails_model(pretrained=False)

    conj_model.load_state_dict(torch.load("artifacts/cnn_conjunctiva_best.pth", map_location=device))
    palm_model.load_state_dict(torch.load("artifacts/cnn_palm1_best.pth", map_location=device))
    nails_model.load_state_dict(torch.load("artifacts/cnn_nails_best.pth", map_location=device))

    conj_model.to(device).eval()
    palm_model.to(device).eval()
    nails_model.to(device).eval()

    return conj_model, palm_model, nails_model


# ---------------------------
# Ensemble prediction
# ---------------------------
def ensemble_predict(conj_path, palm_path, nails_path):
    conj_img = load_image(conj_path).to(device)
    palm_img = load_image(palm_path).to(device)
    nails_img = load_image(nails_path).to(device)

    conj_model, palm_model, nails_model = load_models()

    with torch.no_grad():
        p_conj = torch.sigmoid(conj_model(conj_img)).item()
        p_palm = torch.sigmoid(palm_model(palm_img)).item()
        p_nails = torch.sigmoid(nails_model(nails_img)).item()

    # Weighted risk score
    risk_score = (
        W_CONJ * p_conj +
        W_PALM * p_palm +
        W_NAILS * p_nails
    )

    final_decision = "Anaemic" if risk_score >= THRESHOLD else "Non-anaemic"

    return {
        "conjunctiva_probability": round(p_conj, 4),
        "palm_probability": round(p_palm, 4),
        "nails_probability": round(p_nails, 4),
        "risk_score": round(risk_score, 4),
        "final_decision": final_decision
    }


# ---------------------------
# Example usage
# ---------------------------
if __name__ == "__main__":
    result = ensemble_predict(
        conj_path="sample_inputs/vaibhavi/conjunctiva.png",
        palm_path="sample_inputs/vaibhavi/palm.png",
        nails_path="sample_inputs/vaibhavi/nails.png"
    )

    print("\n--- ENSEMBLE RESULT ---")
    for k, v in result.items():
        print(f"{k}: {v}")

