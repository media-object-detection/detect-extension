from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from torchvision import datasets, transforms
import os
from PIL import Image
import base64
import io

app = Flask(__name__)
CORS(app)

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

# 모델 불러오기 및 클래스 이름 정의
model_path = 'resnet34_custom_model.pth'
model = torch.load(model_path, map_location='cpu')
data_dir = './custom_dataset'
train_datasets = datasets.ImageFolder(os.path.join(data_dir, 'train'), transforms_train)
class_names = train_datasets.classes

# 이미지 검색 엔드포인트
@app.route('/search', methods=['POST'])
def search():
    try:
        # 이미지 데이터 받기
        base64_data = request.form['image']
        # base64 데이터를 이미지로 디코딩
        image_data = base64.b64decode(base64_data.split(',')[1])
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        image = transforms_test(image).unsqueeze(0)

        # 모델 예측
        with torch.no_grad():
            outputs = model(image)
            _, preds = torch.max(outputs, 1)
            predicted_class = class_names[preds[0]]

        # 예측 결과를 JSON으로 반환
        result = {"class": predicted_class}
        return jsonify(result)
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)