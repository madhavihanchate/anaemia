import torch
import torch.nn as nn
from torchvision import models


class CNNPalm(nn.Module):

    def __init__(self, pretrained=True):
        super(CNNPalm, self).__init__()

        # Load EfficientNet-B0 backbone
        self.model = models.efficientnet_b0(pretrained=pretrained)

        # Replace classifier head for binary classification
        in_features = self.model.classifier[1].in_features
        self.model.classifier[1] = nn.Linear(in_features, 1)

    def forward(self, x):
        return self.model(x)


def get_model(pretrained=True):
    return CNNPalm(pretrained=pretrained)