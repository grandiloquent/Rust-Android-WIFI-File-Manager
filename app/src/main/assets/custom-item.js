
class CustomItem extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({
            mode: 'open'
        });
        const wrapper = document.createElement("div");
        wrapper.setAttribute("class", "wrapper");
        const style = document.createElement('style');
        style.textContent = `.more {
  width: 48px;
  height: 48px;
  padding: 12px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.icon {
  width: 48px;
  height: 48px;
  padding: 6px;
  box-sizing: border-box;
  flex-shrink: 0;

}

.title {
  flex-grow: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  max-height: 2.5em;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.25;
  text-overflow: ellipsis;
  font-weight: normal
}

.wrapper {
  height: 48px;
  border-top: 1px solid #dadce0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}`;
        this.wrapper = wrapper;
        this.shadowRoot.append(style, wrapper);
    }

    set title(value) {
        this._title.textContent = value;
    }

    connectedCallback() {
        const folder = "M20.016 18v-9.984h-16.031v9.984h16.031zM20.016 6q0.797 0 1.383 0.609t0.586 1.406v9.984q0 0.797-0.586 1.406t-1.383 0.609h-16.031q-0.797 0-1.383-0.609t-0.586-1.406v-12q0-0.797 0.586-1.406t1.383-0.609h6l2.016 2.016h8.016z";
        const file = "M12.984 9h5.531l-5.531-5.484v5.484zM6 2.016h8.016l6 6v12q0 0.797-0.609 1.383t-1.406 0.586h-12q-0.797 0-1.406-0.586t-0.609-1.383l0.047-16.031q0-0.797 0.586-1.383t1.383-0.586z";

        const isFolder = this.hasAttribute('folder');
        this.wrapper.innerHTML = `<div class="icon">
  <svg viewBox="0 0 24 24">
    <path d="${isFolder ? folder : file}"></path>
  </svg>
</div>
<div bind="_title" @click="click" data-id="0" class="title" data-path="${this.getAttribute('path')}" data-is-directory="${this.getAttribute('isDirectory')}">${this.getAttribute('title')}</div>
<div bind @click="click" data-id="1" data-path="${this.getAttribute('path')}" data-is-directory="${this.getAttribute('isDirectory')}" class="more">
  <svg viewBox="0 0 24 24">
    <path d="M12 15.984q0.797 0 1.406 0.609t0.609 1.406-0.609 1.406-1.406 0.609-1.406-0.609-0.609-1.406 0.609-1.406 1.406-0.609zM12 9.984q0.797 0 1.406 0.609t0.609 1.406-0.609 1.406-1.406 0.609-1.406-0.609-0.609-1.406 0.609-1.406 1.406-0.609zM12 8.016q-0.797 0-1.406-0.609t-0.609-1.406 0.609-1.406 1.406-0.609 1.406 0.609 0.609 1.406-0.609 1.406-1.406 0.609z"></path>
  </svg>
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

    click(evt) {
        this.dispatchEvent(new CustomEvent('submit', {
            detail: {
                id: evt.currentTarget.dataset.id,
                path: evt.currentTarget.dataset.path,
                isDirectory: evt.currentTarget.dataset.isDirectory
            }
        }));
    }

}

customElements.define('custom-item', CustomItem);
