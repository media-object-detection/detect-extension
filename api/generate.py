import torch
import os
import torch.nn as nn
import torch.optim as optim
import torchvision
from torchvision import datasets, models, transforms
import numpy as np
import time
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
from PIL import Image

# 이미지 출력 함수
def imshow(input, title):
    # torch.Tensor를 numpy 객체로 변환
    input = input.numpy().transpose((1, 2, 0))
    # 이미지 정규화 해제하기
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    input = std * input + mean
    input = np.clip(input, 0, 1)
    # 이미지 출력
    plt.imshow(input)
    plt.title(title)
    plt.show()

def load_or_train_model(model_path, train_dataloader, train_datasets,criterion):
    if os.path.exists(model_path):
        # Load the existing model
        model = torch.load(model_path)
        print(f"Existing model loaded from {model_path}")
    else:
        # Train a new model
        model = models.resnet34(pretrained=True)
        num_features = model.fc.in_features
        model.fc = nn.Linear(num_features, 3)
        model = model.to(device)

        optimizer = optim.SGD(model.parameters(), lr=0.001, momentum=0.9)

        num_epochs = 10
        model.train()
        start_time = time.time()

        for epoch in range(num_epochs):
            running_loss = 0.
            running_corrects = 0

            for inputs, labels in train_dataloader:
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                loss = criterion(outputs, labels)

                loss.backward()
                optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / len(train_datasets)
            epoch_acc = running_corrects / len(train_datasets) * 100.

            print('#{} Loss: {:.4f} Acc: {:.4f}% Time: {:.4f}s'.format(epoch, epoch_loss, epoch_acc, time.time() - start_time))

        # Save the trained model
        torch.save(model, model_path)
        print(f"Trained model saved at {model_path}")

    return model

if __name__ == '__main__':
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu") # device 객체

    transforms_train = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    transforms_test = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    data_dir = './custom_dataset'
    train_datasets = datasets.ImageFolder(os.path.join(data_dir, 'train'), transforms_train)
    test_datasets = datasets.ImageFolder(os.path.join(data_dir, 'test'), transforms_test)

    train_dataloader = torch.utils.data.DataLoader(train_datasets, batch_size=4, shuffle=True, num_workers=4)
    test_dataloader = torch.utils.data.DataLoader(test_datasets, batch_size=4, shuffle=True, num_workers=4)

    print('학습 데이터셋 크기:', len(train_datasets))
    print('테스트 데이터셋 크기:', len(test_datasets))

    class_names = train_datasets.classes
    print('클래스:', class_names)

    print('클래스 레이블:', train_datasets.classes)

    iterator = iter(train_dataloader)

    inputs, classes = next(iterator)
    out = torchvision.utils.make_grid(inputs)
    # imshow(out, title=[class_names[x] for x in classes])
    criterion = nn.CrossEntropyLoss()
    model_path = 'resnet34_custom_model.pth'
    model = load_or_train_model(model_path, train_dataloader, train_datasets,criterion)

    start_time = time.time()
    with torch.no_grad():
        running_loss = 0.
        running_corrects = 0

        for inputs, labels in test_dataloader:
            inputs = inputs.to(device)
            labels = labels.to(device)

            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)

            # 한 배치의 첫 번째 이미지에 대하여 결과 시각화
            # print(f'[예측 결과: {class_names[preds[0]]}] (실제 정답: {class_names[labels.data[0]]})')
            # imshow(inputs.cpu().data[0], title='예측 결과: ' + class_names[preds[0]])

        epoch_loss = running_loss / len(test_datasets)
        epoch_acc = running_corrects / len(test_datasets) * 100.
        print('[Test Phase] Loss: {:.4f} Acc: {:.4f}% Time: {:.4f}s'.format(epoch_loss, epoch_acc, time.time() - start_time))
    
    image = Image.open('aaa.png').convert('RGB')
    image = transforms_test(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
        _, preds = torch.max(outputs, 1)
        print('예측 결과: ' + class_names[preds[0]])