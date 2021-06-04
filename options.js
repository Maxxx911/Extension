// TODO Вынести в файл с константами
const baseURL = 'https://demo-quant-monitoring.invento-labs.com';
let baseUrlInput = document.getElementById('baseUrl');
let apiSecretInput = document.getElementById('apiSecret');

baseUrlInput.addEventListener('input', (event) => {
  chrome.storage.sync.set({ baseUrl: event.target.value });
});

apiSecretInput.addEventListener('input', (event) => {
  chrome.storage.sync.set({ clientKey: event.target.value });
});

chrome.storage.sync.get(['baseUrl', 'clientKey'], ({ baseUrl, clientKey }) => {
  if (baseUrl != null) {
    baseUrlInput.value = baseUrl;
  } else {
    baseUrlInput.value = baseURL;
  }
  if (clientKey != null) {
    apiSecretInput.value = clientKey;
  }
});
