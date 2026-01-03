import torch
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report


# Load dataset (ONLY test data)

from dataloader.conjuctiva_loader import load_conjunctiva_dataset

X, y = load_conjunctiva_dataset()

from sklearn.model_selection import train_test_split

# same split logic as training (IMPORTANT)

X_train_full, X_test, y_train_full, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    stratify=y,
    random_state=42
)


# Convert to torch tensors

X_test = torch.tensor(X_test).permute(0, 3, 1, 2)
y_test = torch.tensor(y_test)


# Load model

from models.cnn_conjuctiva import get_model

device = torch.device("cpu")

model = get_model(pretrained=False)
model.load_state_dict(
    torch.load("artifacts/cnn_conjunctiva_best.pth", map_location=device)
)
model = model.to(device)
model.eval()


# Inference

all_preds = []
all_labels = []

with torch.no_grad():
    for i in range(len(X_test)):
        image = X_test[i].unsqueeze(0).to(device)
        label = y_test[i].item()

        logit = model(image)
        prob = torch.sigmoid(logit).item()
        pred = 1 if prob >= 0.35 else 0

        all_preds.append(pred)
        all_labels.append(label)

all_preds = np.array(all_preds)
all_labels = np.array(all_labels)


# Metrics

print("\nConfusion Matrix:")
print(confusion_matrix(all_labels, all_preds))

print("\nClassification Report:")
print(classification_report(
    all_labels,
    all_preds,
    target_names=["Non-anaemic", "Anaemic"]
))


# Anaemia-focused metrics

tp = np.sum((all_preds == 1) & (all_labels == 1))
fn = np.sum((all_preds == 0) & (all_labels == 1))
fp = np.sum((all_preds == 1) & (all_labels == 0))

recall = tp / (tp + fn + 1e-6)
precision = tp / (tp + fp + 1e-6)

print(f"\nAnaemia Recall (Sensitivity): {recall:.4f}")
print(f"Anaemia Precision: {precision:.4f}")
