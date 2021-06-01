let startButton = document.getElementById("startRecognition");
let sendRequsetButton = document.getElementById("sendRequest");

sendRequsetButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.storage.sync.get([ 'elementXpath', 'href', 'clientKey', 'baseUrl'], ({ elementXpath, href, clientKey, baseUrl}) => {
    const req = new XMLHttpRequest();
    req.open("POST", baseUrl, true);
    req.setRequestHeader('client-key', clientKey)
    req.send(JSON.stringify({'elementXpath': elementXpath, 'href': href}))
    req.onreadystatechange = function() {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        console.log("Got response 200!");
    }
    }
  })
});


let isClicked = false

startButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  isClicked = !isClicked
  chrome.storage.sync.set({'isClicked': isClicked})
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: changeViewType,
  });
});


// The body of this function will be executed as a content script inside the
// current page
function changeViewType() {
  
  function getPathTo(element) {
    if (element.id!=='')
        return '//*[@id="'+element.id+'"]';
    if (element===document.body)
        return "/HTML/" + element.tagName;
  
    var ix= 0;
    var siblings= element.parentNode.childNodes;
    for (var i= 0; i<siblings.length; i++) {
        var sibling= siblings[i];
        if (sibling===element)
            return getPathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
        if (sibling.nodeType===1 && sibling.tagName===element.tagName)
            ix++;
    }
  }

  let oldElement = null
  let choosedElementXpath = null
  let rawChoosedElement = null

    function mouseMoveHandle(object){
      let elem = object.srcElement
      oldElement = elem.cloneNode(true)
      elem.style.backgroundColor = '#c3e0cb'
    }

    function mouseMoveHandleBack(object){
      let elem = object.srcElement
      console.log(elem.style.backgroundColor)
      if(oldElement != null && elem.style.backgroundColor != 'rgb(143, 183, 154)'){
        elem.replaceWith(oldElement)  
      }
    }  
    
    function mouseClickHandel(object){
      if(rawChoosedElement != null && choosedElementXpath != null){
        let el = document.evaluate(choosedElementXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if(el != null){
          el.replaceWith(rawChoosedElement)
          rawChoosedElement = null
        }
      }
      let elem = object.srcElement
      let xpath = getPathTo(elem)
      choosedElementXpath= xpath
      rawChoosedElement = oldElement
      chrome.storage.sync.set({'elementXpath': xpath, 'href': window.location.href})
      elem.style.backgroundColor = '#8fb79a'
    }
    


  chrome.storage.sync.get([ 'isClicked'], ({ isClicked }) => {
    let body = document.getElementsByTagName('body')[0];
    if(isClicked){
      body.addEventListener('mouseover', mouseMoveHandle)
      body.addEventListener('mouseout', mouseMoveHandleBack)
      body.addEventListener('click', mouseClickHandel)
  
    }else{
      // TODO НЕ РАБОТАЕТ
      body.removeEventListener('mouseover', mouseMoveHandle)
      body.removeEventListener('mouseout', mouseMoveHandleBack)
      body.removeEventListener('click', mouseClickHandel)
    }
  });
}