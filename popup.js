document.addEventListener('DOMContentLoaded', function() {
  const captureButton = document.getElementById('capture');
  
  captureButton.addEventListener('click', function() {
    chrome.windows.create({
      url: 'popup2.html',
      type: 'popup',
      width: 400,
      height: 300,
    });
    
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: captureScreen,
      });
    });
  });

  // 유튜브 영상을 캡처하고 vision ai를 통해 객체를 감지
  function captureScreen() {

    const video = document.querySelector('video');
    if (!video) {
      alert('No video element found');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL('image/png').split(',')[1];

    // background.js에 API 키를 요청
    chrome.runtime.sendMessage({ action: "getApiKey" }, function(response) {
      if (response) {
        const apiKey = response.API_KEY;

        fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: dataURL,
                },
                features: [
                  {
                    type: 'OBJECT_LOCALIZATION',
                    maxResults: 5,
                  },
                ],
              },
            ],
          }),
        })
        .then((response) => response.json())
        .then((data) => {
          if (
            data.responses &&
            data.responses[0] &&
            data.responses[0].localizedObjectAnnotations
          ) {
            const detectList = data.responses[0].localizedObjectAnnotations;

            // popup2.html로 데이터를 전송
            chrome.runtime.sendMessage({ data: { detectList, dataURL } }, function(response) {
                console.log('popup1.js: success');
            });

          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });

      } else {
        console.error('API 키를 찾을 수 없음.');
      }
    });
  }
});