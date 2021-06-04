let color = '#3aa757';
const baseURL = 'https://demo-quant-monitoring.invento-labs.com';
const baseEndpoint = '/api/public/v1.0/resource/draft';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ baseUrl: baseURL, baseEndpoint });
  console.log(`Default base url set to ${baseURL + baseEndpoint}`);
});
