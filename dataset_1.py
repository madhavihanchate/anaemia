import os
import cv2
import numpy as np

IMG_SIZE = 224
DATA_DIR = "data"
CATEGORIES = ["conjunctiva", "nails", "palm"]
LABELS = {"anaemic": 1, "non_anaemic": 0}

def load_dataset():
    X = []
    y = []

    for category in CATEGORIES:
        category_path = os.path.join(DATA_DIR, category)

        if not os.path.exists(category_path):
            raise FileNotFoundError(f"Missing folder: {category_path}")

        for label_name, label_value in LABELS.items():
            label_path = os.path.join(category_path, label_name)

            if not os.path.exists(label_path):
                raise FileNotFoundError(f"Missing folder: {label_path}")

            for img_name in os.listdir(label_path):
                img_path = os.path.join(label_path, img_name)

                try:
                    img = cv2.imread(img_path)
                    if img is None:
                        continue

                    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
                    img = img / 255.0

                    X.append(img)
                    y.append(label_value)

                except Exception as e:
                    print(f"Skipping {img_path} : {e}")

    return np.array(X), np.array(y)

if __name__ == "__main__":
    X, y = load_dataset()
    print("Dataset loaded successfully")
    print("Total samples:", len(X))
    print("Image shape:", X.shape)
    print("Labels shape:", y.shape)
    print("Anaemic samples:", np.sum(y == 1))
    print("Non-anaemic samples:", np.sum(y == 0))
