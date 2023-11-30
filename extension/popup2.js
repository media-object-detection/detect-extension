chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.data) {
    const { dataURL, detectList, textList } = request.data;
    const objectList = document.getElementById('objectList');
    const textInfoList = document.getElementById('textInfoList');

    const canvas = new Image();
    canvas.src = 'data:image/png;base64,' + dataURL;

    detectList.forEach((object, index) => {
      const button = document.createElement('button');
      button.textContent = object.name;
      button.addEventListener('click', function () {
        // 선택한 객체에 대한 크롭 및 저장 로직 추가
        console.log(`clicked ${object.name}[${index}]`);

        // 이미지 크롭 및 다운로드 관련 코드
        const vertices = object.boundingPoly.normalizedVertices;
        const startX = vertices[0].x * canvas.width;
        const startY = vertices[0].y * canvas.height;
        const endX = vertices[2].x * canvas.width;
        const endY = vertices[2].y * canvas.height;

        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = endX - startX;
        croppedCanvas.height = endY - startY;
        const croppedContext = croppedCanvas.getContext('2d');
        croppedContext.drawImage(
          canvas,
          startX,
          startY,
          croppedCanvas.width,
          croppedCanvas.height,
          0,
          0,
          croppedCanvas.width,
          croppedCanvas.height
        );

        const croppedDataURL = croppedCanvas.toDataURL('image/png');

        const formData = new FormData();
        formData.append('image', croppedDataURL);

        fetch('http://127.0.0.1:5000/edit', {
          method: 'POST',
          body: { dataURL, text, coordinates },
        })
          .then((response) => {
            return response.blob();
          })
          .then((imageBlob) => {
            const imageContainer = document.getElementById('image-container');
            const imageUrl = URL.createObjectURL(imageBlob);
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imageContainer.appendChild(imgElement);
          })
          .catch((error) => {
            console.error('error: ' + error);
          });

        fetch('http://127.0.0.1:5000/search', {
          method: 'POST',
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            const responseContainer =
              document.getElementById('response-container');
            responseContainer.innerText =
              'Product Info: ' + JSON.stringify(data);
          })
          .catch((error) => {
            console.error('error: ' + error);
          });

        const a = document.createElement('a');
        a.href = croppedDataURL;
        a.download = `object_${index}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
      objectList.appendChild(button);
      textInfoListList.appendChild(button);
    });
  }
});
