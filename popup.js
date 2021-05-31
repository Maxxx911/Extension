let changeColor = document.getElementById("startRecognition");

let isClicked = false

changeColor.addEventListener("click", async () => {
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
        return element.tagName;
  
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
  let rawChoosedElement = null

    function mouseMoveHandle(object){
      elem = object.srcElement
      oldElement = elem.cloneNode(true)
      elem.style.backgroundColor = '#c3e0cb'
    }

    function mouseMoveHandleBack(object){
      elem = object.srcElement
      console.log(elem.style.backgroundColor)
      if(oldElement != null && elem.style.backgroundColor != 'rgb(143, 183, 154)'){
        elem.replaceWith(oldElement)  
      }
    }  
    
    // TODO Не работает подмена
    function mouseClickHandel(object){
      if(rawChoosedElement != null){
        chrome.storage.sync.get([ 'elementXpath'], ({ elementXpath }) => {
          console.log(`CHROME XPTA ${elementXpath}`)
          let el = document.evaluate(elementXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          // console.log(`ELEMEENE ${el}`)
          // if(el != null){
          //   el.replaceWith(rawChoosedElement)
          //   console.log(`ELEMEENE AFTER REPLACE${el}`)
          //   rawChoosedElement = null
          // }
        });
      }
      elem = object.srcElement
      // TODO Иногда нужно перед XPATH /HTML/ иногда нет
      xpath = getPathTo(elem)
      rawChoosedElement = elem.cloneNode(true)
      chrome.storage.sync.set({'elementXpath': xpath})
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