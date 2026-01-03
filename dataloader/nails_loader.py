import os
import cv2
import numpy as np

# ================= CONFIG ================= #
IMG_SIZE = 224
DATA_DIR = "data/Nails"
LABELS = {
    "anaemic": 1,
    "non_anaemic": 0
}

# ================= COLOR STANDARDIZATION ================= #
def gray_world_white_balance(img):

    img = img.astype(np.float32)

    avg_r = np.mean(img[:, :, 0])
    avg_g = np.mean(img[:, :, 1])
    avg_b = np.mean(img[:, :, 2])

    avg_gray = (avg_r + avg_g + avg_b) / 3.0

    # Avoid division by zero
    img[:, :, 0] *= avg_gray / (avg_r + 1e-6)
    img[:, :, 1] *= avg_gray / (avg_g + 1e-6)
    img[:, :, 2] *= avg_gray / (avg_b + 1e-6)

    # Clip to valid range
    img = np.clip(img, 0, 255)

    return img


# ================= LOADER ================= #
def load_nails_dataset():
    X = []
    y = []

    if not os.path.exists(DATA_DIR):
        raise FileNotFoundError(f"Nails data folder not found: {DATA_DIR}")

    for label_name, label_value in LABELS.items():
        label_path = os.path.join(DATA_DIR, label_name)

        if not os.path.exists(label_path):
            raise FileNotFoundError(f"Missing folder: {label_path}")

        for img_name in os.listdir(label_path):
            img_path = os.path.join(label_path, img_name)

            try:
                img = cv2.imread(img_path)
                if img is None:
                    continue

                # ---- BGR → RGB ----
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

                # ---- Resize ----
                img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))

                # ---- Color standardization (Gray-World) ----
                img = gray_world_white_balance(img)

                # ---- Normalize ----
                img = img / 255.0
                img = img.astype(np.float32)

                X.append(img)
                y.append(label_value)

            except Exception as e:
                print(f"[WARNING] Skipping {img_path}: {e}")

    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.int64)

    return X, y


# ================= SANITY TEST ================= #
if __name__ == "__main__":
    X, y = load_nails_dataset()

    print("Nails dataset loaded with color standardization (Gray-World)")
    print("Total samples :", len(X))
    print("Image shape  :", X.shape)
    print("Anaemic      :", np.sum(y == 1))
    print("Non-anaemic  :", np.sum(y == 0))
