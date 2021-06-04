let startButton = document.getElementById('startRecognition');
let sendRequsetButton = document.getElementById('sendRequest');

sendRequsetButton.addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.storage.sync.get(
    ['elementXpath', 'href', 'clientKey', 'baseUrl', 'baseEndpoint'],
    ({ elementXpath, href, clientKey, baseUrl, baseEndpoint }) => {
      const req = new XMLHttpRequest();
      req.open('POST', baseUrl + baseEndpoint, true);
      req.setRequestHeader('X-Api-Key', clientKey);
      req.setRequestHeader('Content-Type', 'application/json');
      req.send(JSON.stringify({ xpath_string: elementXpath, url: href }));
      req.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          alert('Element was add to draft');
        }
      };
    }
  );
});

let isClicked = false;

startButton.addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  isClicked = !isClicked;
  chrome.storage.sync.set({ isClicked: isClicked });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: changeViewType,
  });
});

// The body of this function will be executed as a content script inside the
// current page
function changeViewType() {
  function getPathTo(element) {
    if (element.id !== '') return '//*[@id="' + element.id + '"]';
    if (element === document.body) return '/HTML/' + element.tagName;

    var ix = 0;
    var siblings = element.parentNode.childNodes;
    for (var i = 0; i < siblings.length; i++) {
      var sibling = siblings[i];
      if (sibling === element)
        return getPathTo(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
    }
  }

  let oldElement = null;
  let choosedElementXpath = null;
  let rawChoosedElement = null;

  function mouseMoveHandle(object) {
    let elem = object.srcElement;
    oldElement = elem.cloneNode(true);
    elem.style.backgroundColor = '#c3e0cb';
  }

  function mouseMoveHandleBack(object) {
    let elem = object.srcElement;
    console.log(elem.style.backgroundColor);
    if (oldElement != null && elem.style.backgroundColor != 'rgb(143, 183, 154)') {
      elem.replaceWith(oldElement);
    }
  }

  function mouseClickHandel(object) {
    // Если элемент был ранее выбран
    if (rawChoosedElement != null && choosedElementXpath != null) {
      // Если пользователь отклоняет изменение, то ничего не делаем
      if (!confirm('Do you really want to change the item?')) {
        return;
      }
      // Находим старый элемент
      let el = document.evaluate(
        choosedElementXpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      // Если нашли, заменяем его на старый
      if (el != null) {
        el.replaceWith(rawChoosedElement);
        rawChoosedElement = null;
      }
    } else {
      alert('Element has been chosen!');
    }
    // Получаем src выбраного элемента
    let elem = object.srcElement;
    // Получаем xpath
    let xpath = getPathTo(elem);
    // Обновляем переменные, отвечающие за востановление элемента при следующем клике
    choosedElementXpath = xpath;
    rawChoosedElement = oldElement;
    // Сохраняем в сторэдж
    chrome.storage.sync.set({ elementXpath: xpath, href: window.location.href });
    // Меняем цвет
    elem.style.backgroundColor = '#8fb79a';
  }

  chrome.storage.sync.get(['isClicked'], ({ isClicked }) => {
    let body = document.getElementsByTagName('body')[0];
    if (isClicked) {
      body.addEventListener('mouseover', mouseMoveHandle);
      body.addEventListener('mouseout', mouseMoveHandleBack);
      body.addEventListener('click', mouseClickHandel);
    } else {
      // TODO НЕ РАБОТАЕТ
      body.removeEventListener('mouseover', mouseMoveHandle);
      body.removeEventListener('mouseout', mouseMoveHandleBack);
      body.removeEventListener('click', mouseClickHandel);
    }
  });
}
