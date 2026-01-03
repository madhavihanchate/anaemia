# loading dataset and preparing data
from dataloader.nails_loader import load_nails_dataset
X, y = load_nails_dataset()


# train test split
from sklearn.model_selection import train_test_split
#  split out TEST set (20%)
X_train_full, X_test, y_train_full, y_test = train_test_split(
    X,
    y,
    test_size=0.20,          
    stratify=y,              
    random_state=42
)

# : split TRAIN into TRAIN + VAL
# Val = 20% of train → 0.2 * 0.8 = 0.16 
X_train, X_val, y_train, y_val = train_test_split(
    X_train_full,
    y_train_full,
    test_size=0.20,          
    stratify=y_train_full,
    random_state=42
)


# convert to torch tensors
import torch

X_train = torch.tensor(X_train).permute(0, 3, 1, 2)
X_val   = torch.tensor(X_val).permute(0, 3, 1, 2)
X_test  = torch.tensor(X_test).permute(0, 3, 1, 2)

y_train = torch.tensor(y_train)
y_val   = torch.tensor(y_val)
y_test  = torch.tensor(y_test)


# create dataloaders
from torch.utils.data import TensorDataset, DataLoader

train_loader = DataLoader(
    TensorDataset(X_train, y_train),
    batch_size=16,
    shuffle=True
)

val_loader = DataLoader(
    TensorDataset(X_val, y_val),
    batch_size=16,
    shuffle=False
)


# model
from models.cnn_nails import get_model
model = get_model(pretrained=True)

# move model to device
device = torch.device("cpu")
model = model.to(device)

# define criterion
import torch.nn as nn
criterion = nn.BCEWithLogitsLoss()


# define optimizer
import torch.optim as optim
optimizer = optim.Adam(model.parameters(), lr=1e-4)

import os
os.makedirs("artifacts", exist_ok=True)


best_val_loss = float("inf")
num_epochs = 20

for epoch in range(num_epochs):
    # ---------- TRAIN ----------
    model.train()
    train_loss = 0.0

    for images, labels in train_loader:
        images = images.to(device)
        labels = labels.to(device).float().unsqueeze(1)

        optimizer.zero_grad()

        outputs = model(images)
        loss = criterion(outputs, labels)

        loss.backward()
        optimizer.step()

        train_loss += loss.item()

    train_loss /= len(train_loader)

    # ---------- VALIDATION ----------
    model.eval()
    val_loss = 0.0

    with torch.no_grad():
        for images, labels in val_loader:
            images = images.to(device)
            labels = labels.to(device).float().unsqueeze(1)

            outputs = model(images)
            loss = criterion(outputs, labels)
            val_loss += loss.item()

    val_loss /= len(val_loader)

    # ---------- SAVE BEST MODEL ----------
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        torch.save(model.state_dict(), "artifacts/cnn_nails_best.pth")

    print(
        f"Epoch [{epoch+1}/{num_epochs}] | "
        f"Train Loss: {train_loss:.4f} | "
        f"Val Loss: {val_loss:.4f}"
    )

