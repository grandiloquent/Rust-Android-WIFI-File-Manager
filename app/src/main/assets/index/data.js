(() => {
    class CustomPathsBottomSheet extends HTMLElement {

        constructor() {
            super();
            this.attachShadow({
                mode: 'open'
            });
            const wrapper = document.createElement("div");
            wrapper.setAttribute("class", "wrapper");
            const style = document.createElement('style');
            style.textContent = `.icon
{
    display: inline-block;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    fill: currentColor;
    stroke: none;
    margin-right: 12px;
}
button
{
    padding: 0;
    border: none;
    outline: none;
    font: inherit;
    text-transform: inherit;
    color: inherit;
    background: transparent;
}
button
{
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
.menu-item
{
    padding: 0;
    height: 48px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
}
.bottom-sheet-layout-content-wrapper
{
    -webkit-box-flex: 1;
    flex: 1;
    overflow-y: scroll;
    max-height: 379.2px;
}
.bottom-sheet-layout-header-title-wrapper
{
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    flex-direction: column;
    display: flex;
    margin-left: 12px;
}
.bottom-sheet-layout-header
{
    -webkit-box-pack: justify;
    justify-content: space-between;
    display: flex;
    margin-top: 8px;
}
.bottom-sheet-drag-line
{
    background: #0f0f0f;
    opacity: .15;
    border-radius: 4px;
    height: 4px;
    margin: 0 auto;
    width: 40px;
    margin-top: 8px;
}
.bottom-sheet-layout-header-wrapper
{
    overflow: hidden;
    -webkit-box-flex: 0;
    flex: none;
    border-bottom: 1px solid #fff;
}
.bottom-sheet-layout
{
    border-radius: 12px;
    background-color: #fff;
    display: block;
    overflow: hidden;
    position: fixed;
    margin: 0 8px 24px;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
}
.overlay
{
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
    cursor: pointer;
    background-color: rgba(0,0,0,.6);
}
.wrapper
{
    position: fixed;
    z-index: 5;
}
.buttons
{
    display: grid;
    grid-template-columns: repeat(2,1fr);
    width: 100%;
    background: #dadce0;
    margin: 0 12px;
    gap: 1px;
    height: 100%;
}
.buttons>button
{
    background: #fff;
    margin-left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}`;
            this.wrapper = wrapper;
            this.shadowRoot.append(style, wrapper);
        }

        set data(value) {

            value && this.contentWrapper.insertAdjacentHTML('afterbegin', value.map(element => {
                const html = `<div bind @click="click" data-path="${element}" class="menu-item">
      <button style="display: flex; align-items: center;">
        <div style="flex-grow: 1;text-overflow: ellipsis;overflow: hidden;">
          ${element}
        </div>
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M12.71,12l8.15,8.15l-0.71,0.71L12,12.71l-8.15,8.15l-0.71-0.71L11.29,12L3.15,3.85l0.71-0.71L12,11.29l8.15-8.15l0.71,0.71 L12.71,12z">
            </path>
          </svg>
        </div>
      </button>
    </div>`
                return html;
            }).join(''));
            this.bind(this.contentWrapper);
        }

        close() {
            this.remove();
        }

        closeDelete() {
            this.remove();
            localStorage.setItem('paths', '');
        }

        click(evt) {
            removePathLocalStorage(evt.currentTarget.dataset.path);
            evt.currentTarget.remove();
        }

        submit() {
            this.dispatchEvent(new CustomEvent('submit'));
            this.remove();
        }

        connectedCallback() {
            const html = `<div bind @click="close" class="overlay">
    </div>
    <div class="bottom-sheet-layout">
      <div class="bottom-sheet-layout-header-wrapper">
        <div class="bottom-sheet-drag-line">
        </div>
        <div class="bottom-sheet-layout-header">
          <div class="bottom-sheet-layout-header-title-wrapper">
          </div>
        </div>
      </div>
      <div bind="contentWrapper" class="bottom-sheet-layout-content-wrapper">
      </div>
    </div>`;
            this.wrapper.innerHTML = html;
            this.bind(this.wrapper);
            this.insertBottomButtons();
        }

        bind(parent) {
            // <div bind="name" @click="close"/>
            // 绑定 div 元素, 绑定后可以通过 this.name 访问该元素
            // @click：@+事件名称 将该元素的单击事件绑定到 this.close 方法
            parent.querySelectorAll('[bind]').forEach(element => {
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
        }

        insertBottomButtons() {
            const html = `<div class="menu-item">
      <div class="buttons">
        <button bind @click="closeDelete">
          取消
        </button> <button bind @click="submit">确定
        </button>
      </div>
    </div>`
            this.contentWrapper.innerHTML = html;
        }

    }

    customElements.define('custom-paths-bottom-sheet', CustomPathsBottomSheet);
})();

function insertPathLocalStorage(newPath) {
    const pathData = localStorage.getItem('paths');
    let path = (pathData && JSON.parse(pathData)) || [];
    path.push(decodeURIComponent(newPath));
    // 移除数组中的重复项
    path = [...new Set(path)];
    localStorage.setItem('paths', JSON.stringify(path));
}

function removePathLocalStorage(newPath) {
    const pathData = localStorage.getItem('paths');
    let path = (pathData && JSON.parse(pathData)) || [];
    let index = path.indexOf(newPath);
    if (index !== -1)
        path.splice(index, 1);
    // 移除数组中的重复项
    path = [...new Set(path)];
    localStorage.setItem('paths', JSON.stringify(path));
}

function getPaths() {
    const pathData = localStorage.getItem('paths');
    if (!pathData) {
        return null;
    }

    return JSON.parse(pathData);
}
function rename(path) {
    const source = substringAfterLast(decodeURIComponent(detail.path), "/");

    const dialog = document.createElement('custom-dialog');
    const div = document.createElement('div');
    dialog.setAttribute('title', "重命名");
    div.style = `display:flex;flex-direction:column;row-gap:10px;`
    dialog.appendChild(div);
    div.innerHTML = `<style>input[type="text"]
{
    background-color: transparent;
    border: 1px solid #dadce0;
    margin: 0;
    padding: 0 0 0 16px;
    font-size: 16px;
    font-family: Roboto,Helvetica Neue,Arial,sans-serif;
    color: rgba(0,0,0,.87);
    word-wrap: break-word;
    display: flex;
    flex: 1;
    -webkit-tap-highlight-color: transparent;
    width: 100%;
    line-height: 24px;
    padding-left: 3px;
    padding-right: 2px;
    overflow-y: hidden;
    outline: 0;
    box-sizing: border-box;
}</style>
    <input class="key" type="text" />`;
    const key = div.querySelector('.key');
    key.value = source;
    window.requestAnimationFrame(() => {
        if (source.indexOf('.') !== -1) {
            key.focus()
            key.setSelectionRange(0, source.lastIndexOf('.'))
        }
    })
    dialog.addEventListener('submit', async evt => {
        fetch(`/api/file/rename?path=${path || '/storage/emulated/0'}&dst=${key.value.trim()}`)
    })
    document.body.appendChild(dialog);
}
(() => {
    class CustomContextBottomSheet extends HTMLElement {

        constructor() {
            super();
            this.attachShadow({
                mode: 'open'
            });
            const wrapper = document.createElement("div");
            wrapper.setAttribute("class", "wrapper");
            const style = document.createElement('style');
            style.textContent = `.icon
{
    display: inline-block;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    fill: currentColor;
    stroke: none;
    margin-right: 12px;
}
button
{
    padding: 0;
    border: none;
    outline: none;
    font: inherit;
    text-transform: inherit;
    color: inherit;
    background: transparent;
}
button
{
    cursor: pointer;
    box-sizing: border-box;
    text-align: initial;
    text-transform: unset;
    width: 100%;
    display: flex;
    padding: 0;
    margin-left: 32px;
    font-size: 1.6rem;
    line-height: 2.2rem;
}
.menu-item
{
    padding: 0;
    height: 48px;
    display: flex;
    -webkit-box-align: center;
    align-context: center;
}
.bottom-sheet-layout-content-wrapper
{
    -webkit-box-flex: 1;
    flex: 1;
    overflow-y: scroll;
    max-height: 379.2px;
}
.bottom-sheet-layout-header-title-wrapper
{
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    flex-direction: column;
    display: flex;
    margin-left: 12px;
}
.bottom-sheet-layout-header
{
    -webkit-box-pack: justify;
    justify-content: space-between;
    display: flex;
    margin-top: 8px;
}
.bottom-sheet-drag-line
{
    background: #0f0f0f;
    opacity: .15;
    border-radius: 4px;
    height: 4px;
    margin: 0 auto;
    width: 40px;
    margin-top: 8px;
}
.bottom-sheet-layout-header-wrapper
{
    overflow: hidden;
    -webkit-box-flex: 0;
    flex: none;
    border-bottom: 1px solid #fff;
}
.bottom-sheet-layout
{
    border-radius: 12px;
    background-color: #fff;
    display: block;
    overflow: hidden;
    position: fixed;
    margin: 0 8px 24px;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
}
.overlay
{
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
    cursor: pointer;
    background-color: rgba(0,0,0,.6);
}
.wrapper
{
    position: fixed;
    z-index: 5;
}
.buttons
{
    display: grid;
    grid-template-columns: repeat(2,1fr);
    width: 100%;
    background: #dadce0;
    margin: 0 12px;
    gap: 1px;
    height: 100%;
}
.buttons>button
{
    background: #fff;
    margin-left: 0;
    display: flex;
    align-context: center;
    justify-content: center;
}`;
            this.wrapper = wrapper;
            this.shadowRoot.append(style, wrapper);
        }

        set data(value) {

            value && this.contentWrapper.insertAdjacentHTML('afterbegin', value.map(element => {
                const html = `<div bind @click="submit" data-path="${element}" class="menu-item">
      <button style="display: flex; align-context: center;">
        <div style="flex-grow: 1;text-overflow: ellipsis;overflow: hidden;">
          ${element}
        </div>
      </button>
    </div>`
                return html;
            }).join(''));
            this.bind(this.contentWrapper);
        }

        close() {
            this.remove();
        }

        submit(evt) {
            this.dispatchEvent(new CustomEvent('submit', {
                detail: evt.currentTarget.dataset.path,
            }));
            this.remove();
        }

        connectedCallback() {
            const html = `<div bind @click="close" class="overlay">
    </div>
    <div class="bottom-sheet-layout">
      <div class="bottom-sheet-layout-header-wrapper">
        <div class="bottom-sheet-drag-line">
        </div>
        <div class="bottom-sheet-layout-header">
          <div class="bottom-sheet-layout-header-title-wrapper">
          </div>
        </div>
      </div>
      <div bind="contentWrapper" class="bottom-sheet-layout-content-wrapper">
      </div>
    </div>`;
            this.wrapper.innerHTML = html;
            this.bind(this.wrapper);
        }

        bind(parent) {
            // <div bind="name" @click="close"/>
            // 绑定 div 元素, 绑定后可以通过 this.name 访问该元素
            // @click：@+事件名称 将该元素的单击事件绑定到 this.close 方法
            parent.querySelectorAll('[bind]').forEach(element => {
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
        }



    }

    customElements.define('custom-context-bottom-sheet', CustomContextBottomSheet);
})();