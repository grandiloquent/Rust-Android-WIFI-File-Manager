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
    border: 1px solid rgba(0,0,0,0.1);
    padding: 8px
}
`;
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

        navigate(e) {
            this.dispatchEvent(new CustomEvent('submit', {
                detail: e.currentTarget.dataset.href
            }));
        }

        _close(evt) {
            evt.stopPropagation();
            this.style.display = "none";
            this.dispatchEvent(new CustomEvent('submit', {
                detail: 1
            }));
        }

        _submit(evt) {
            evt.stopPropagation();
            this.style.display = "none";
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
    const customDialog = document.createElement('custom-dialog');
    document.body.appendChild(customDialog);
    customDialog.title = ""
    window.customDialog = customDialog;
    customDialog.addEventListener('submit', evt => {
        localStorage.setItem('snippet', evt.detail);
    });
    customDialog.content = localStorage.getItem('snippet');
    customDialog.style.display = 'none';
    insertTranslateDialog();

    function insertTranslateDialog() {
        const customDialog = document.createElement('custom-dialog');
        document.body.appendChild(customDialog);
        customDialog.title = "翻译"
        window.translator = customDialog;
        customDialog.addEventListener('submit', async evt => {
            textarea.setRangeText(`\n\n${await translate(evt.detail.replaceAll(/[\r\n]+/g, ''), 'zh')}
          `, textarea.selectionStart, textarea.selectionEnd, 'end');
            customDialog.content = '';
        });
        customDialog.style.display = 'none';
    }
})();

(() => {
    class CustomBottomSheet extends HTMLElement {

        constructor() {
            super();
            this.attachShadow({
                mode: 'open'
            });
            const wrapper = document.createElement("div");
            wrapper.setAttribute("class", "wrapper");
            const style = document.createElement('style');
            style.textContent = `.icon {

  display: inline-block;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  fill: currentColor;
  stroke: none;
  margin-right: 12px;

}


button {
  padding: 0;
  border: none;
  outline: none;
  font: inherit;
  text-transform: inherit;
  color: inherit;
  background: transparent
}

button {

  cursor: pointer;
  box-sizing: border-box;
  text-align: initial;
  text-transform: unset;
  width: 100%;
  display: flex;
  padding: 0;
  margin-left: 12px;
  font-size: 1.6rem;
  line-height: 2.2rem;

}

.menu-item {

  padding: 0;
  height: 48px;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  background:#fff;
  font-size: 1.6rem;
  line-height: 2.2rem;
  justify-content:center;
}

.bottom-sheet-layout-content-wrapper {

  -webkit-box-flex: 1;
  flex: 1;
  overflow-y: scroll;
  /*max-height: 379.2px;*/

    display: grid;
    grid-template-columns: repeat(3,1fr);
    background:#dadce0;
    gap:1px;
    border:1px solid #dadce0;
}

.bottom-sheet-layout-header-title-wrapper {
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  flex-direction: column;
  display: flex;
  margin-left: 12px
}

.bottom-sheet-layout-header {
  -webkit-box-pack: justify;
  justify-content: space-between;
  display: flex;
  margin-top: 8px
}

.bottom-sheet-drag-line {
  background: #0f0f0f;
  opacity: .15;
  border-radius: 4px;
  height: 4px;
  margin: 0 auto;
  width: 40px;
  margin-top: 8px
}

.bottom-sheet-layout-header-wrapper {
  overflow: hidden;
  -webkit-box-flex: 0;
  flex: none;
  border-bottom: 1px solid #fff;
}

.bottom-sheet-layout {
  border-radius: 12px;
  background-color: #fff;
  display: block;
  overflow: hidden;
  position: fixed;
  margin: 0 8px 24px;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2
}

.overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.6)
}

.wrapper {
  position: fixed;
  z-index: 5
}`;
            this.wrapper = wrapper;
            this.shadowRoot.append(style, wrapper);
        }

        close() {
            this.style.display = 'none';
        }

        click(evt) {
            this.dispatchEvent(new CustomEvent('submit', {
                detail: {
                    id: evt.currentTarget.dataset.id
                }
            }));
        }

        set data(value) {


            this.contentWrapper.insertAdjacentHTML('afterbegin', value.map(element => {
                return `<div bind @click="click" data-id="${element.id}"  class="menu-item">${element.title}</div>`;
            }).join(''));
            /////////////////////
            this.contentWrapper.querySelectorAll('[bind]').forEach(element => {
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
                        this[attr.value](evt);
                    });
                });
            });


            this.contentWrapper.innerHTML = `<div bind @click="close" class="menu-item">取消</div>`
        }

    }

    customElements.define('custom-bottom-sheet', CustomBottomSheet);
    /*
    <!--
                        <script type="module" src="./components/custom-bottom-sheet.js"></script>
  <custom-bottom-sheet></custom-bottom-sheet>
  customElements.whenDefined('custom-bottom-sheet').then(() => {
  customBottomSheet.data = []
  })
  -->
  */
})();

////////////////////////////////////////////////////////////

function copyLine(editor, count) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const string = editor.value;
    let offsetStart = start;
    while (offsetStart > 0) {
        if (string[offsetStart - 1] !== '\n' && string[offsetStart - 1] !== '|')
            offsetStart--;
        else {
            // while (offsetStart > 0) {
            //     if (/\s/.test(string[offsetStart - 1]))
            //         offsetStart--;
            //     else break;
            // }
            break;
        }
    }
    let offsetEnd = end;
    while (offsetEnd < string.length) {
        if (string[offsetEnd + 1] !== '\n' && string[offsetEnd + 1] !== '|')
            offsetEnd++;
        else {
            /* while (offsetEnd < string.length) {
                 if (/\s/.test(string[offsetEnd + 1]))
                     offsetEnd++;
                 else break;
             }*/
            offsetEnd++;
            break;
        }
    }
    const str = string.substring(offsetStart, offsetEnd).trim();
    writeText(str);
    editor.focus()
}

function findBlock(textarea) {
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    const strings = textarea.value;
    if (strings[start] === '\n' && start - 1 > 0) {
        start--;
    }
    let founded = false;
    while (start > 0) {
        if (strings[start] == '\n') {
            let j = start - 1;
            while (j > 0 && /\s/.test(strings[j])) {
                if (strings[j] === '\n') {
                    founded = true;
                    break;
                }
                j--;
            }
        }
        if (founded) {
            break
        }
        start--;
    }
    founded = false;
    while (end + 1 < strings.length) {
        if (strings[end] == '\n') {
            let j = end + 1;
            while (j + 1 < strings.length && /\s/.test(strings[j])) {
                if (strings[j] === '\n') {
                    founded = true;
                    break;
                }
                j++;
            }
        }
        if (founded) {
            break
        }
        end++;
    }
    return [start, end]
}

function findCodeBlock(textarea) {
    const value = textarea.value;
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    while (start > -1) {
        if (value[start] === '`' && value[start - 1] === '`' && value[start - 2] === '`') {
            start += 1;
            while (start < value.length) {
                if (value[start] === '\n') {
                    start++;
                    break;
                }
                start++;
            }
            break;
        }
        start--;
    }
    while (end < value.length) {
        if (value[end] === '`' && value[end + 1] === '`' && value[end + 2] === '`') {
            end--;
            break;
        }
        end++;
    }
    return [start, end];
}

function findCodeBlockExtend(textarea) {
    const value = textarea.value;
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    while (start > -1) {
        if (value[start] === '`' && value[start - 1] === '`' && value[start - 2] === '`') {
            // start += 1;
            start -= 2;
            while (start - 1 > 0 && value[start - 1] !== '\n') {
                start--;
            }
            break;
        }
        start--;
    }
    while (end < value.length) {
        if (value[end] === '`' && value[end + 1] === '`' && value[end + 2] === '`') {
            end += 2;
            break;
        }
        end++;
    }
    return [start, end];
}

function findExtendPosition(editor) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    let string = editor.value;
    let offsetStart = start;
    while (offsetStart > 0) {
        if (!/\s/.test(string[offsetStart - 1])) offsetStart--; else {
            let os = offsetStart;
            while (os > 0 && /\s/.test(string[os - 1])) {
                os--;
            }
            if ([...string.substring(offsetStart, os).matchAll(/\n/g)].length > 1) {
                break;
            }
            offsetStart = os;
        }
    }
    let offsetEnd = end;
    while (offsetEnd < string.length) {
        if (!/\s/.test(string[offsetEnd + 1])) {
            offsetEnd++;
        } else {
            let oe = offsetEnd;
            while (oe < string.length && /\s/.test(string[oe + 1])) {
                oe++;
            }
            if ([...string.substring(offsetEnd, oe + 1).matchAll(/\n/g)].length > 1) {
                offsetEnd++;
                break;
            }
            offsetEnd = oe + 1;
        }
    }
    while (offsetStart > 0 && string[offsetStart - 1] !== '\n') {
        offsetStart--;
    }
    // if (/\s/.test(string[offsetEnd])) {
    //     offsetEnd--;
    // }
    return [offsetStart, offsetEnd];
}

function formatHead(editor, count) {
    // console.log("formatHead, ");
    // let start = editor.selectionStart;
    // const string = editor.value;
    // while (start - 1 > -1 && string.charAt(start - 1) !== '\n') {
    //     start--;
    // }
    // editor.setRangeText('#'.repeat(count || 2) + " ", start, start);
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const string = editor.value;
    let offsetStart = start;
    while (offsetStart > 0) {
        if (string[offsetStart - 1] !== '\n')
            offsetStart--;
        else {
            while (offsetStart > 0) {
                if (/\s/.test(string[offsetStart - 1]))
                    offsetStart--;
                else break;
            }
            break;
        }
    }
    let offsetEnd = end;
    while (offsetEnd < string.length) {
        if (string[offsetEnd + 1] !== '\n')
            offsetEnd++;
        else {
            while (offsetEnd < string.length) {
                if (/\s/.test(string[offsetEnd + 1]))
                    offsetEnd++;
                else break;
            }
            break;
        }
    }
    editor.setRangeText(`\n\n${'#'.repeat(count)} ${string.substring(offsetStart, offsetEnd).trim()}\n`, offsetStart,
        offsetEnd, 'end');
}

function getLine(extended) {
    let start = textarea.selectionStart;
    const strings = textarea.value;
    if (strings[start] === '\n' && start - 1 > 0) {
        start--;
    }
    while (start > 0 && strings[start] !== '\n') {
        start--;
    }
    if (extended) {
        while (start + 1 < strings.length && /\s/.test(strings[start])) {
            start++
        }
    }
    let end = textarea.selectionEnd;
    while (end + 1 < strings.length && strings[end] !== '\n') {
        end++;
    }
    return [strings.substring(start, end), start, end]
}

function getSelectedString(textarea) {
    return textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
}

function humanFileSize(size) {
    if (size === 0) return '0';
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
}

async function insertLink() {
    const strings = await readText();
    let name = '';
    try {
        const url = new URL(strings);
        name = await (await fetch(`/api/title?host=${url.host}&path=${encodeURIComponent(`${url.pathname}${url.search}`)}`)).text()
    } catch (e) {
    }
    textarea.setRangeText(
        `- [${name.trim()}](${strings})`,
        textarea.selectionStart,
        textarea.selectionEnd,
        'end'
    )
}

function jumpPage(textarea) {
    const line = getLine(textarea);
    const value = /(?<=(href|src)=")[^"]+(?=")/.exec(line);
    const path = new URL(window.location).searchParams.get("path");
    if (!value && path) {
        window.open('http://127.0.0.1:8081/' + substringBeforeLast(substringAfter(path, "\\app\\"), "."), "_blank");
        return
    }
    const src = `${window.location.origin}${window.location.pathname}?path=${encodeURIComponent(`${substringBeforeLast(path, "/")}/${value[0]}`)}`;
    window.open(src, '_blank');
}

async function loadFile(path) {
    document.title = substringAfterLast(decodeURIComponent(path), "\\")
    const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`, {cache: "no-cache"});
    return res.text();
}

async function loadData(id) {
    const res = await fetch(`/api/note?action=1&id=${id}`, {cache: "no-cache"});
    return res.json();
}

function onCode() {
    pasteCode();
}

function onCopy() {
    const pv = findCodeBlock(textarea);
    writeText(textarea.value.substring(pv[0], pv[1]));
}

function onCopyLine() {
    copyLine(textarea);
}

async function onEval() {
    const p = findBlock(textarea);
    const s = textarea.value.substring(p[0], p[1]);
    textarea.setRangeText(
        ` = ${eval(s)}`,
        p[1],
        p[1],
        'end'
    )
}

function onInsert() {
    this.textarea.setRangeText(`/*
  */`, this.textarea.selectionStart, this.textarea.selectionEnd)
}

function onPreview() {
    const searchParams = new URL(window.location).searchParams;
    if (searchParams.has("path")) {
        const path = searchParams.get("path");
        window.open(`/markdown?path=${path}`, '_blank')
    } else {
        window.open(`/markdown?id=${searchParams.get("id")}`, '_blank')
    }
}

async function onSave() {
    const searchParams = new URL(window.location).searchParams;
    if (searchParams.has("path")) {
        const path = searchParams.get("path");
        if (path.endsWith(".srt")) {
            textarea.value = textarea.value.replace(/WEBVTT\s+/, "").replaceAll(/\s*\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}[\s]+/g, ' ');
            return;
        }
        const res = await fetch(`/api/file?path=${path}`, {
            method: 'POST', body: textarea.value
        });
        toast.setAttribute('message', '成功');
    } else {
        const content = textarea.value
        if (content.trim().length === 0) return;
        const id = searchParams.has("id") ? parseInt(searchParams.get("id")) : 0;
        const title = substringBefore(content.trim(), '\n').trim();
        const obj = {
            title, content
        }
        if (id) {
            obj.id = id;
        }
        const res = await fetch(`/api/note`, {
            method: 'POST', body: JSON.stringify(obj)
        });
        toast.setAttribute('message', '成功');
    }
}

function onShow() {
    customBottomSheet.style.display = 'block'
}

function onShowTranslator() {
    onInsert();
}

async function onSnippet() {
    const strings = await readText();
    const selected = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
    )
    const snippet = localStorage.getItem('snippet');
    textarea.setRangeText(
        snippet.replaceAll('$1', strings)
            .replaceAll('$2', selected),
        textarea.selectionEnd,
        textarea.selectionEnd,
        'end'
    )
}

async function onTranslateChinese() {
    let array1 = getLine();
    textarea.setRangeText(`\n\n${await translate(array1[0], 'zh')}
          `, array1[2], array1[2], 'end');
}

async function onTranslateEnglish() {
    let array1 = getLine();
    textarea.setRangeText(`\n\n${await translate(array1[0], 'en')}
          `, array1[2], array1[2], 'end');
}

async function onTranslateFn() {
    let array1 = getLine();
    textarea.setRangeText(`\n\nfn ${snake(await translate(array1[0], 'en'))}(){
    }
          `, array1[2], array1[2], 'end');
}

function openLink() {
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    while (start > -1 && textarea.value[start] !== ' ' && textarea.value[start] !== '(' && textarea.value[start] !== '\n') {
        start--;
    }
    while (end < textarea.value.length && textarea.value[end] !== ' ' && textarea.value[end] !== ')' && textarea.value[end] !== '\n') {
        end++;
    }
    if (textarea.selectionStart === textarea.selectionEnd) {
        window.open(textarea.value.substring(start + 1, end));
    } else {
        textarea.setRangeText(` [](${textarea.value.substring(start, end).trim()})`, start, end, 'end');
    }
}

async function pasteCode() {
    let strings;
    if (typeof NativeAndroid !== 'undefined') {
        strings = NativeAndroid.readText()
    } else {
        strings = await navigator.clipboard.readText()
    }
    textarea.setRangeText(`
## 

\`\`\`javascript
${strings}
\`\`\`
`, textarea.selectionStart, textarea.selectionEnd, 'end');
}

async function readText() {
    // const textarea = document.createElement("textarea");
    // textarea.style.position = 'fixed';
    // textarea.style.right = '100%';
    // document.body.appendChild(textarea);
    // textarea.value = message;
    // textarea.select();
    // document.execCommand('paste');
    // return textarea.value;
    let strings;
    if (typeof NativeAndroid !== 'undefined') {
        strings = NativeAndroid.readText()
    } else {
        strings = await navigator.clipboard.readText()
    }
    return strings
}

async function removeLines() {
    if (textarea.selectionStart === textarea.selectionEnd) {
        const p = findExtendPosition(textarea);
        let start = p[0];
        while (start > -1 && /\s/.test(textarea.value[start - 1])) {
            start--;
        }
        let end = p[1];
        while (end + 1 < textarea.value.length && /\s/.test(textarea.value[end + 1])) end++;
        if (typeof NativeAndroid !== 'undefined') {
            NativeAndroid.writeText(textarea.value.substring(start, end));
        } else {
            await navigator.clipboard.writeText(textarea.value.substring(start, end))
        }
        textarea.setRangeText('\n', start, end);
        textarea.selectionEnd = start;
    } else {
        textarea.value = textarea.value.substring(textarea.selectionEnd);
        textarea.selectionStart = 0;
        textarea.selectionEnd = 0;
        textarea.scrollLeft = 0;
        textarea.scrollTop = 0;
    }
}

async function render() {
    textarea.value = localStorage.getItem("content");

    const searchParams = new URL(window.location).searchParams;
    if (searchParams.has("path")) {
        const path = searchParams.get("path");
        try {
            textarea.value = await loadFile(path);
        } catch (error) {
            console.log(error)
        }
    } else {
        const id = searchParams.get("id");
        try {
            const obj = await loadData(id)
            document.title = obj.title;
            textarea.value = obj.content;
        } catch (error) {
            console.log(error)
        }
    }


}

function snake(string) {
    return string.replaceAll(/(?<=[a-z])[A-Z]/g, m => `_${m}`).toLowerCase()
        .replaceAll(/[ -]([a-z])/g, m => `_${m[1]}`)
}

function sortLines() {
    const points = findBlock(textarea);
    const lines = textarea.value.substring(points[0], points[1]).split('\n')
        .sort((x, y) => {
            let v1 = /\d{4}\)/.exec(x);
            let v2 = /\d{4}\)/.exec(y)
            if (v1 && v2)
                return v1[0].localeCompare(v2[0])
            return x.localeCompare(y);
        });
    textarea.setRangeText(`\n\n${lines.join('\n')}`, points[0], points[1], 'end');
}

function tab(textarea) {
    textarea.addEventListener('keydown', function (e) {
        if (e.keyCode === 9) {
            const p = findExtendPosition(textarea);
            const start = this.selectionStart;
            textarea.setRangeText(
                textarea.value.substring(p[0], p[1])
                    .split('\n')
                    .map(i => {
                        return '\t' + i;
                    })
                    .join('\n'), p[0], p[1]);
            this.selectionStart = this.selectionEnd = start + 1;
            // prevent the focus lose
            e.preventDefault();
        }
    }, false);
}

function toBlocks(string) {
    let count = 0;
    let buf = [];
    const blocks = [];
    for (let i = 0; i < string.length; i++) {
        buf.push(string[i])
        if (string[i] === '{') {
            count++;
        } else if (string[i] === '}') {
            count--;
            if (count === 0) {
                blocks.push(buf.join(''))
                buf = [];
            }
        }
    }
    return blocks;
}

async function translate(value, to) {
    try {
        const response = await fetch(`${window.location.protocol}//kpkpkp.cn/api/trans?q=${encodeURIComponent(value.trim())}&to=${to}`);
        const obj = await response.json();
        return obj.sentences.map((element, index) => {
            return element.trans;
        }).join(' ');
    } catch (error) {
        console.log(error);
    }
}

function tryUploadImageFromClipboard(success, error) {
    navigator.permissions.query({
        name: "clipboard-read"
    }).then(result => {
        if (result.state === "granted" || result.state === "prompt") {
            navigator.clipboard.read().then(data => {
                console.log(data[0].types);
                const blob = data[0].getType("image/png");
                console.log(blob.then(res => {
                    const formData = new FormData();
                    formData.append("images", res, "1.png");
                    fetch(`https://lucidu.cn/v1/picture`, {
                        method: "POST", body: formData
                    }).then(res => {
                        return res.text();
                    }).then(obj => {
                        success(obj);
                    })
                }).catch(err => {
                    console.log(err)
                    error(err);
                }))
            })
                .catch(err => {
                    error(err);
                });
        } else {
            error(new Error());
        }
    });
}

function uploadHanlder(editor) {
    tryUploadImageFromClipboard((ok) => {
        const string = `![](https://static.lucidu.cn/images/${ok})\n\n`;
        editor.setRangeText(string, editor.selectionStart, editor.selectionStart);
    }, () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', async ev => {
            const file = input.files[0];
            const imageFile = await uploadImage(file, file.name);
            const string = `![](https://static.lucidu.cn/images/${imageFile})\n\n`;
            editor.setRangeText(string, editor.selectionStart, editor.selectionStart);
        });
        input.click();
    });
}

async function uploadImage(image, name) {
    const form = new FormData();
    form.append('images', image, name)
    const response = await fetch(`https://lucidu.cn/v1/picture`, {
        method: 'POST', body: form
    });
    return await response.text();
}

