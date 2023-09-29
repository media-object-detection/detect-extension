document.addEventListener('DOMContentLoaded', function() {
  const captureButton = document.getElementById('capture');
  
  captureButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        func: captureScreen
      });
    });
  });
  
  function captureScreen() {
    const video = document.querySelector('video');
    if (!video) {
      console.error('No video element found');
      return;
    }
  
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    const dataURL = canvas.toDataURL('image/png');
  
    // Base64 인코딩된 이미지 데이터 전송
    fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: dataURL.split(',')[1]
            },
            features: [
              {
                type: 'OBJECT_LOCALIZATION',
                maxResults: 5
              }
            ]
          }
        ]
      }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Vision API 응답:', data);
      if (data.responses && data.responses[0] && data.responses[0].localizedObjectAnnotations) {
        const annotations = data.responses[0].localizedObjectAnnotations;
        annotations.forEach((object, index) => {
          const vertices = object.boundingPoly.normalizedVertices;
          const startX = vertices[0].x * canvas.width;
          const startY = vertices[0].y * canvas.height;
          const endX = vertices[2].x * canvas.width;
          const endY = vertices[2].y * canvas.height;
  
          const croppedCanvas = document.createElement('canvas');
          croppedCanvas.width = endX - startX;
          croppedCanvas.height = endY - startY;
          const croppedContext = croppedCanvas.getContext('2d');
          croppedContext.drawImage(canvas, startX, startY, croppedCanvas.width, croppedCanvas.height, 0, 0, croppedCanvas.width, croppedCanvas.height);
  
          const croppedDataURL = croppedCanvas.toDataURL('image/png');
  
          const a = document.createElement('a');
          a.href = croppedDataURL;
          a.download = `object_${index}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
});
