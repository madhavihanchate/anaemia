import os
import cv2
import numpy as np

# ================= CONFIG ================= #
IMG_SIZE = 224
DATA_DIR = "data/palm"
LABELS = {
    "anaemic": 1,
    "non_anaemic": 0
}

# ================= LOADER ================= #
def load_palm_dataset():
    X = []
    y = []

    if not os.path.exists(DATA_DIR):
        raise FileNotFoundError(f"Palm data folder not found: {DATA_DIR}")

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

                # ---- RGB → LAB ----
                lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
                l, a, b = cv2.split(lab)

                # ---- LIGHT CLAHE (lower clipLimit) ----
                clahe = cv2.createCLAHE(clipLimit=1.2, tileGridSize=(8, 8))
                l = clahe.apply(l)

                # ---- Merge back ----
                lab = cv2.merge((l, a, b))
                img = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)

                # ---- Normalize ----
                img = img.astype(np.float32) / 255.0

                X.append(img)
                y.append(label_value)

            except Exception as e:
                print(f"[WARNING] Skipping {img_path}: {e}")

    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.int64)

    return X, y


# ================= SANITY TEST ================= #
if __name__ == "__main__":
    X, y = load_palm_dataset()

    print("Palm dataset loaded with LIGHT CLAHE")
    print("Total samples :", len(X))
    print("Image shape  :", X.shape)
    print("Anaemic      :", np.sum(y == 1))
    print("Non-anaemic  :", np.sum(y == 0))
