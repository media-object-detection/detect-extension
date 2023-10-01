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
});