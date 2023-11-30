// Vision API 요청을 위한 HTTP POST 요청을 보내는 함수
async function detectTextInImage(imageData) {
  const apiKey = 'YOUR_API_KEY'; // 본인의 Google Cloud API 키로 대체해주세요.

  const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  const requestBody = {
    requests: [
      {
        image: {
          content: imageData,
        },
        features: [
          {
            type: 'TEXT_DETECTION',
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.responses && data.responses.length > 0) {
      const textAnnotations = data.responses[0].textAnnotations;

      // textAnnotations 배열의 첫 번째 요소는 전체 텍스트를 나타내므로, 제외하고 나머지 요소를 출력합니다.
      if (textAnnotations && textAnnotations.length > 1) {
        const detectedTexts = textAnnotations.slice(1);

        // 감지된 텍스트와 해당 좌표를 출력합니다.
        detectedTexts.forEach((textObj) => {
          const text = textObj.description;
          const coordinates = textObj.boundingPoly.vertices;
        });
      } else {
        console.log('No text found in the image.');
      }
    } else {
      console.log('No valid response from the Vision API.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// 이미지 데이터를 Base64로 인코딩한 후 Vision API로 전달
function processImage() {
  const image = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // 예시로 이미지 데이터를 가져오는 부분입니다. 실제로는 이미지를 가져오는 방법에 따라 달라질 수 있습니다.
  image.src = 'YOUR_IMAGE_URL'; // 이미지 URL을 여기에 입력해주세요.

  image.onload = function () {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg').split(',')[1];

    detectTextInImage(imageData);
  };
}

processImage();
