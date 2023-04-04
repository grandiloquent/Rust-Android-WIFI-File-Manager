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


////////////////////////////////////////////////////////////





function getSelectedString(textarea) {
    return textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
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
    const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`, { cache: "no-cache" });
    return res.text();
}

async function loadData(id) {
    const res = await fetch(`/api/article?id=${id}`, { cache: "no-cache" });
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

function onInsertComment() {
    let start = textarea.selectionStart;
    const strings = textarea.value;
    if (strings[start] === '\n' && start - 1 > 0) {
        start--;
    }
    while (start > 0 && strings[start - 1] !== '\n') {
        start--;
    }
    let end = textarea.selectionEnd;
    while (end + 1 < strings.length && strings[end] !== '\n') {
        end++;
    }
    if (end < textarea.value.length) {
        let nexEnd=end+1;
        while (nexEnd + 1 < strings.length && /\s+/.test(strings[nexEnd])) {
            nexEnd++;
        }
        this.textarea.setRangeText(`${' '.repeat(nexEnd-end-1)}// `, start, start,'end')
        return 
    }
    this.textarea.setRangeText(`// `, this.textarea.selectionStart, this.textarea.selectionEnd,'end')
}

 

async function onSave() {
    const firstLine = textarea.value.trim().split("\n", 2)[0];
    const obj = {

        content: substringAfter(textarea.value.trim(), "\n"),
        title: firstLine.replace(/^#+ +/, ''),
    };
    const searchParams = new URL(window.location.href).searchParams;
    const id = searchParams.get('id');
    let baseUri = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : '';

    if (id) {
        obj.id = parseInt(id);
        obj.update_at = new Date().getTime();
    } else {
        obj.create_at = new Date().getTime();
        obj.update_at = new Date().getTime();
    }
    if (obj.title.indexOf('|') !== -1) {
        const tags = JSON.parse(substringAfter(obj.title, '|').trim() || '[]');
        if (tags.length) {
            obj.tags = tags;
        }
        obj.title = substringBefore(obj.title, '|').trim();
    }

    const m = /!\[]\(([^)]*?)\)/.exec(textarea.value);
    if (m) {
        const thumbnail = m[1];
        if (thumbnail) {
            obj.thumbnail = thumbnail;
        }
    }
    const response = await fetch(`${baseUri}/api/article`, {
        method: 'POST',
        body: JSON.stringify(obj)
    });
    const res = await response.text();
    if (id)
        toast.setAttribute('message', '成功');
    else
        window.location = `${window.location.origin}${window.location.pathname}?id=${res.id}`
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




async function onTranslateFn() {
    let array1 = getLine();
    textarea.setRangeText(`\n\nfn ${snake(await translate(array1[0], 'en'))}(){
    }
          `, array1[2], array1[2], 'end');
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
        if (id) {
            try {
                const obj = await loadData(id)
                document.title = obj.title;
                textarea.value = `# ${obj.title}|${JSON.stringify(obj.tags)}
        
${obj.content.trim()}`
            } catch (error) {
                console.log(error)
            }
        }

    }


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



function formatIndentIncrease() {
    if (textarea.selectionStart === textarea.selectionEnd) {
        const line = getLine();
        textarea.setRangeText(
            ' '.repeat(2) + line[0],
            line[1], line[2], 'end'
        )
    } else {
        const string = getSelectedString(textarea);
        textarea.setRangeText(string.split('\n')
            // .filter(x => x.trim())
            .map(x => '  ' + x).join('\n'), textarea.selectionStart, textarea.selectionEnd, 'end');
    }
}
function formatIndentDecrease() {
    if (textarea.selectionStart === textarea.selectionEnd) {
        const line = getLine();
        if(line[0].startsWith("  "))
        textarea.setRangeText(
            line[0].slice(2),
            line[1], line[2], 'end'
        )
    } else {
        const string = getSelectedString(textarea);
        textarea.setRangeText(string.split('\n')
            // .filter(x => x.trim())
            .map(x =>x.startsWith("  ")?  x.slice(2):x).join('\n'), textarea.selectionStart, textarea.selectionEnd, 'end');
    }
}