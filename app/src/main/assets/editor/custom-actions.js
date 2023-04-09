(() => {

  class CustomDialog extends HTMLElement {

    constructor() {
      super();
      this.attachShadow({
        mode: 'open'
      });
      const wrapper = document.createElement("div");
      wrapper.setAttribute("class", "wrapper");
      const style = document.createElement('style');
      style.textContent = `.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  z-index: 4;
  margin: 0 40px;
  padding: 0 env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}

.dialog {
  position: relative;
  z-index: 2;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  flex-direction: column;
  max-height: 100%;
  box-sizing: border-box;
  padding: 16px;
  margin: 0 auto;
  overflow-x: hidden;
  overflow-y: auto;
  font-size: 13px;
  color: #0f0f0f;
  border: none;
  min-width: 250px;
  max-width: 356px;
  box-shadow: 0 0 24px 12px rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  background-color: #fff;
}

.dialog-header {
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  flex-direction: column;
  flex-shrink: 0;
}

.h2 {
  margin: 0 0 3px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  max-height: 2.5em;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.25;
  text-overflow: ellipsis;
  font-weight: normal;
  font-size: 18px;
}

.dialog-body {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 100vh;
}

.dialog-buttons {
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: end;
  justify-content: flex-end;
  margin-top: 12px;
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  height: 36px;
  font-size: 14px;
  line-height: 36px;
  border-radius: 18px;
  color: #0f0f0f;
}

.disabled {
  color: #909090
}

.overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.3);
}

input,
textarea {
  background-color: transparent;
  padding-bottom: 4px;
  outline: none;
  box-sizing: border-box;
  border: none;
  border-radius: 0;
  margin-bottom: 1px;
  font: inherit;
  color: #0f0f0f
}

textarea {
  -webkit-appearance: none;
  appearance: none;
  min-height: 8.4rem;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 8px
}`;
      this.wrapper = wrapper;
      this.shadowRoot.append(style, wrapper);
    }

    static get observedAttributes() {
      return ['title'];
    }

    set title(name) {
      this._title.textContent = name;
    }

    set content(value) {
      this.textarea.value = value;
    }
    get content() {
      return this.textarea.value;
    }

    navigate(e) {
      this.dispatchEvent(new CustomEvent('submit', {
        detail: e.currentTarget.dataset.href
      }));
      this.remove();
    }

    _close(evt) {
      evt.stopPropagation();
      this.remove();
    }

    _submit(evt) {
      evt.stopPropagation();
      this.remove();
      this.dispatchEvent(new CustomEvent('submit', {
        detail: this.textarea.value
      }));
    }

    connectedCallback() {
      this.wrapper.innerHTML = `<div class="dialog">
  <div class="dialog-header">
    <h2 bind="_title" class="h2">${this.getAttribute("title")}</h2>
  </div>
  <div bind="_message" class="dialog-body">
    <textarea bind="textarea"></textarea>
  </div>
  <div class="dialog-buttons">
    <div bind class="button" @click="_close">
      取消
    </div>
    <div bind class="button disabled" @click="_submit">
      确定
    </div>
  </div>
</div>
<div bind class="overlay" @click="_close">
</div>`;
      this.wrapper.querySelectorAll('[bind]').forEach(element => {
        if (element.getAttribute('bind')) {
          this[element.getAttribute('bind')] = element;
        }
        [...element.attributes].filter(attr => attr.nodeName.startsWith('@')).forEach(attr => {
          if (!attr.value) return;
          element.addEventListener(attr.nodeName.slice(1), evt => {
            this[attr.value](evt);
          });
        });
      })
    }

    attributeChangedCallback(name, oldValue, newValue) {
    }
  }

  customElements.define('custom-dialog', CustomDialog);


})();
(() => {

  class CustomActions extends HTMLElement {

    constructor() {
      super();
      this.attachShadow({
        mode: 'open'
      });
      const wrapper = document.createElement("div");
      wrapper.setAttribute("class", "wrapper");
      const style = document.createElement('style');
      style.textContent = `.icon{display:inline-block;flex-shrink:0;width:24px;height:24px;fill:currentColor;stroke:none;margin-right:12px}button{padding:0;border:none;outline:none;font:inherit;text-transform:inherit;color:inherit;background:transparent}button{cursor:pointer;box-sizing:border-box;text-align:initial;text-transform:unset;width:100%;display:flex;padding:0;margin-left:12px;font-size:1.6rem;line-height:2.2rem}.menu-item{padding:0;height:48px;display:flex;-webkit-box-align:center;align-items:center;background:#fff;font-size:1.6rem;line-height:2.2rem;justify-content:center}.bottom-sheet-layout-content-wrapper{-webkit-box-flex:1;flex:1;overflow-y:scroll;display:grid;grid-template-columns:repeat(3,1fr);background:#dadce0;gap:1px;border:1px solid #dadce0}.bottom-sheet-layout-header-title-wrapper{-webkit-box-orient:vertical;-webkit-box-direction:normal;flex-direction:column;display:flex;margin-left:12px}.bottom-sheet-layout-header{-webkit-box-pack:justify;justify-content:space-between;display:flex;margin-top:8px}.bottom-sheet-drag-line{background:#0f0f0f;opacity:.15;border-radius:4px;height:4px;margin:0 auto;width:40px;margin-top:8px}.bottom-sheet-layout-header-wrapper{overflow:hidden;-webkit-box-flex:0;flex:none;border-bottom:1px solid #fff}.bottom-sheet-layout{border-radius:12px;background-color:#fff;display:block;overflow:hidden;position:fixed;margin:0 8px 24px;bottom:0;left:0;right:0;z-index:2}.overlay{position:fixed;top:0;bottom:0;left:0;right:0;z-index:1;cursor:pointer;background-color:rgba(0,0,0,.6)}.wrapper{position:fixed;z-index:5}`;
      this.wrapper = wrapper;
      this.shadowRoot.append(style, wrapper);
    }

    click(evt) {
      this.dispatchEvent(new CustomEvent('submit', {
        detail: {
          id: evt.currentTarget.dataset.id
        }
      }));
    }
    close() {
      this.style.display = 'none';
    }
    connectedCallback() {
      this.wrapper.innerHTML = `<div bind @click="close" class="overlay">
    </div>
    <div class="bottom-sheet-layout">
      <div class="bottom-sheet-layout-header-wrapper">
        <div class="bottom-sheet-drag-line">
        </div>
        <div class="bottom-sheet-layout-header">
          <div class="bottom-sheet-layout-header-title-wrapper">
          </div>
          <div bind="contentWrapper" class="bottom-sheet-layout-content-wrapper">
            <div bind @click="insertLink" class="menu-item">
              插入链接
            </div>
            <div bind @click="openLink" class="menu-item">
              打开链接
            </div>
            <div bind @click="preview" class="menu-item">
              预览
            </div>
            <div bind @click="onTranslateChinese" class="menu-item">
              翻译中文
            </div>
            <div bind @click="onTranslateEnglish" class="menu-item">
              翻译英文
            </div>
            <div bind @click="sortLines" class="menu-item">
              排序
            </div>
            <div bind @click="uploadHanlder" class="menu-item">
              上传图片
            </div>
            <div bind @click="onEval" class="menu-item">
              执行表达式
            </div>
            <div bind @click="onDeleteString" class="menu-item">
              删除
            </div>
            <div bind @click="indentCodeBlock" class="menu-item">
              缩进代码块
            </div>
            <div bind @click="onCopyLine" class="menu-item">
              复制行
            </div>
            <div bind @click="onCutLine" class="menu-item">
              剪切行
            </div>
            <div bind @click="pasteCode" class="menu-item">
              粘贴代码
            </div>
            <div bind @click="onInsertComment" class="menu-item">
              评论
            </div>   
            <div bind @click="formatIndentIncrease" class="menu-item">
              缩进
            </div>   
            <div bind @click="formatIndentDecrease" class="menu-item">
              缩退
            </div>  
            <div bind @click="onShowDialog" class="menu-item">
              替换模式
            </div>        
            <div bind @click="cutBefore" class="menu-item">
              剪切前
            </div>  
            <div bind @click="pasteEnd" class="menu-item">
              粘贴后
            </div>   
            <div bind @click="replaceText" class="menu-item">
              粘贴后
            </div> 
            <div bind @click="close" class="menu-item">
              取消
            </div>
          </div>
        </div>
      </div>
    </div>`;
      this.wrapper.querySelectorAll('[bind]').forEach(element => {
        if (element.getAttribute('bind')) {
          this[element.getAttribute('bind')] = element;
        }
        [...element.attributes].filter(attr => attr.nodeName.startsWith('@')).forEach(attr => {
          if (!attr.value) return;
          element.addEventListener(attr.nodeName.slice(1), evt => {
            this.style.display = 'none';
            if (this[attr.value])
              this[attr.value](evt);
            else {
              window[attr.value](evt)
            }
          });
        });
      });
      const patterns = getPatterns();
      if (patterns)
        loadPatterns(patterns);
    }
    
   
 
  }

  customElements.define('custom-actions', CustomActions);

  /*
  ATTRIBUTE_NODE
CDATA_SECTION_NODE
COMMENT_NODE
DOCUMENT_FRAGMENT_NODE
DOCUMENT_NODE
DOCUMENT_POSITION_CONTAINED_BY
DOCUMENT_POSITION_CONTAINS
DOCUMENT_POSITION_DISCONNECTED
DOCUMENT_POSITION_FOLLOWING
DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
DOCUMENT_POSITION_PRECEDING
DOCUMENT_TYPE_NODE
ELEMENT_NODE
ENTITY_NODE
ENTITY_REFERENCE_NODE
NOTATION_NODE
PROCESSING_INSTRUCTION_NODE
TEXT_NODE
accessKey
addEventListener
after
animate
append
appendChild
ariaAtomic
ariaAutoComplete
ariaBusy
ariaChecked
ariaColCount
ariaColIndex
ariaColSpan
ariaCurrent
ariaDescription
ariaDisabled
ariaExpanded
ariaHasPopup
ariaHidden
ariaKeyShortcuts
ariaLabel
ariaLevel
ariaLive
ariaModal
ariaMultiLine
ariaMultiSelectable
ariaOrientation
ariaPlaceholder
ariaPosInSet
ariaPressed
ariaReadOnly
ariaRelevant
ariaRequired
ariaRoleDescription
ariaRowCount
ariaRowIndex
ariaRowSpan
ariaSelected
ariaSetSize
ariaSort
ariaValueMax
ariaValueMin
ariaValueNow
ariaValueText
assignedSlot
attachInternals
attachShadow
attributeStyleMap
attributes
autocapitalize
autofocus
baseURI
before
blur
childElementCount
childNodes
children
classList
className
click
clientHeight
clientLeft
clientTop
clientWidth
cloneNode
closest
compareDocumentPosition
computedStyleMap
contains
contentEditable
dataset
dir
dispatchEvent
draggable
elementTiming
enterKeyHint
firstChild
firstElementChild
focus
getAnimations
getAttribute
getAttributeNS
getAttributeNames
getAttributeNode
getAttributeNodeNS
getBoundingClientRect
getClientRects
getElementsByClassName
getElementsByTagName
getElementsByTagNameNS
getInnerHTML
getRootNode
hasAttribute
hasAttributeNS
hasAttributes
hasChildNodes
hasPointerCapture
hidden
id
innerHTML
innerText
inputMode
insertAdjacentElement
insertAdjacentHTML
insertAdjacentText
insertBefore
isConnected
isContentEditable
isDefaultNamespace
isEqualNode
isSameNode
lang
lastChild
lastElementChild
localName
lookupNamespaceURI
lookupPrefix
matches
namespaceURI
nextElementSibling
nextSibling
nodeName
nodeType
nodeValue
nonce
normalize
offsetHeight
offsetLeft
offsetParent
offsetTop
offsetWidth
onabort
onanimationend
onanimationiteration
onanimationstart
onauxclick
onbeforecopy
onbeforecut
onbeforepaste
onbeforexrselect
onblur
oncancel
oncanplay
oncanplaythrough
onchange
onclick
onclose
oncontextmenu
oncopy
oncuechange
oncut
ondblclick
ondrag
ondragend
ondragenter
ondragleave
ondragover
ondragstart
ondrop
ondurationchange
onemptied
onended
onerror
onfocus
onformdata
onfullscreenchange
onfullscreenerror
ongotpointercapture
oninput
oninvalid
onkeydown
onkeypress
onkeyup
onload
onloadeddata
onloadedmetadata
onloadstart
onlostpointercapture
onmousedown
onmouseenter
onmouseleave
onmousemove
onmouseout
onmouseover
onmouseup
onmousewheel
onpaste
onpause
onplay
onplaying
onpointercancel
onpointerdown
onpointerenter
onpointerleave
onpointermove
onpointerout
onpointerover
onpointerrawupdate
onpointerup
onprogress
onratechange
onreset
onresize
onscroll
onsearch
onseeked
onseeking
onselect
onselectionchange
onselectstart
onstalled
onsubmit
onsuspend
ontimeupdate
ontoggle
ontransitioncancel
ontransitionend
ontransitionrun
ontransitionstart
onvolumechange
onwaiting
onwebkitanimationend
onwebkitanimationiteration
onwebkitanimationstart
onwebkitfullscreenchange
onwebkitfullscreenerror
onwebkittransitionend
onwheel
outerHTML
outerText
ownerDocument
parentElement
parentNode
part
prefix
prepend
previousElementSibling
previousSibling
querySelector
querySelectorAll
releasePointerCapture
remove
removeAttribute
removeAttributeNS
removeAttributeNode
removeChild
removeEventListener
replaceChild
replaceChildren
replaceWith
requestFullscreen
requestPointerLock
scroll
scrollBy
scrollHeight
scrollIntoView
scrollIntoViewIfNeeded
scrollLeft
scrollTo
scrollTop
scrollWidth
setAttribute
setAttributeNS
setAttributeNode
setAttributeNodeNS
setPointerCapture
shadowRoot
slot
spellcheck
style
tabIndex
tagName
textContent
title
toggleAttribute
translate
virtualKeyboardPolicy
webkitMatchesSelector
webkitRequestFullScreen
webkitRequestFullscreen
   */
})();