# anaemia_detection
🩺 Anaemia Detection Using Multi-Modal Image Analysis

This repository contains an end to end anaemia screening system built using computer vision and deep learning, leveraging three physiological visual cues:

Conjunctiva (eye)

Palm

Nails

Each modality is modeled independently using EfficientNetB0, and final decisions are made using a risk aware ensemble inference strategy optimized for high recall, which is critical in medical screening tasks.

📌 Key Features

Modality specific preprocessing pipelines (OpenCV + CLAHE + LAB)

Independent CNN models for conjunctiva, palm, and nails

Stratified train / validation / test split

Recall focused evaluation (medical priority)

Weighted ensemble decision logic

Clean separation of training, evaluation, and inference

Explainable outputs (per modality probabilities + final risk score)

🧠 Problem Statement

Anaemia is a widespread health condition that often remains under diagnosed due to limited access to clinical testing.
This project explores non-invasive, image-based screening using commonly visible physiological indicators, providing a supportive screening tool (not a diagnostic replacement).


