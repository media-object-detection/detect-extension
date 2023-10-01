// 유튜브 영상을 캡처하고 vision ai를 통해 객체를 감지
function CaptureItem() {
    chrome.runtime.sendMessage({ action: 'openPopup' });

    // 팝업이 열린 후 작업을 마치면 팝업을 다시 열도록 변수를 리셋
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'popupClosed') {
            popupOpened = false;
            console.log("close~~", popupOpened);
        }
    });

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
                console.log('popup2.js: success');
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

function AddcaptureButton() {
	var ytpRightControls = document.getElementsByClassName("ytp-right-controls")[0];
	if (ytpRightControls) {
		ytpRightControls.prepend(captureButton);
	}
}

var captureButton = document.createElement("button");
captureButton.className = "captureButton ytp-button";
captureButton.id = "capture";
captureButton.style.width = "auto";
captureButton.innerHTML = `
<svg height="100%" version="1.1" viewBox="-8 -8 40 40" width="100%">
    <use class="ytp-svg-shadow"></use>
    <path d="M24 3l-.743 2h-1.929l-3.474 12h-13.239l-4.615-11h16.812l-.564 2h-13.24l2.937 7h10.428l3.432-12h4.195zm-15.5 15c-.828 0-1.5.672-1.5 1.5 0 .829.672 1.5 1.5 1.5s1.5-.671 1.5-1.5c0-.828-.672-1.5-1.5-1.5zm6.9-7-1.9 7c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5c0-.828-.672-1.5-1.5-1.5z" fill="#fff"></path>
    </svg>

`;
captureButton.style.cssFloat = "left";
captureButton.onclick = CaptureItem;

AddcaptureButton();

document.getElementById('capture').addEventListener('click', CaptureItem);
