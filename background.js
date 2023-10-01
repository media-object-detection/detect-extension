// .env 파일의 내용을 문자열로 가져옴
function getEnvFile() {
  return fetch(chrome.runtime.getURL('.env'))
    .then((response) => response.text());
}

// 읽어온 .env 파일에서 key, value 값 추출
getEnvFile()
  .then((envContent) => {
    const envLines = envContent.split('\n');
    
    // 환경 변수를 저장할 객체
    const envVariables = {};

    for (const line of envLines) {
      const [key, value] = line.split('=');
      if (key && value) {
        envVariables[key] = value;
      }
    }

    // 다른 파일에서 API 키를 사용할 수 있도록 API Key 전송
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if (request.action === "getApiKey") {
          sendResponse(envVariables);
          return true;
        }

        if (request.action === "openPopup") {
          chrome.windows.create({
              url: 'popup2.html',
              type: 'popup',
              width: 400,
              height: 400,
          });
        }  
      }
    );
  });
