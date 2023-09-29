// background.js에 API 키를 요청
chrome.runtime.sendMessage({ action: "getApiKey" }, function(response) {
    if (response) {
      const apiKey = response.API_KEY;
    }
  });