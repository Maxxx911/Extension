let color = '#3aa757';
const baseURL = 'https://demo-quant-monitoring.invento-labs.com/'


chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({'baseUrl': baseURL});
  console.log(`Default base url set to ${baseURL}`);
});

