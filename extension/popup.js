document.addEventListener('DOMContentLoaded', function () {
  document
    .getElementById('captureBtn')
    .addEventListener('click', captureScreenshot);
});

function captureScreenshot() {
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (dataUrl) {
    var screenshotArea = document.getElementById('screenshotArea');
    var img = new Image();
    img.src = dataUrl;
    screenshotArea.appendChild(img);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document
    .getElementById('captureBtn')
    .addEventListener('click', captureScreenshot);
});

function captureScreenshot() {
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (dataUrl) {
    chrome.runtime.sendMessage({ action: 'capturedImage', dataUrl: dataUrl });
  });
}
