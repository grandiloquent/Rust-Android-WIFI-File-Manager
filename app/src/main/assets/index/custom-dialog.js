class CustomDialog extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({
      mode: 'open'
    });
    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "wrapper");
    const style = document.createElement('style');
    style.textContent = `.btn {
  font-weight: 500;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  height: 36px;
  font-size: 14px;
  line-height: 36px;
  border-radius: 18px;
}

.dialog-buttons {
  flex-shrink: 0;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: end;
  justify-content: flex-end;
  margin-top: 12px
}

.dialog-body {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 100vh;
  /*white-space: pre-wrap*/
}

.modern-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.3)
}

h2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  max-height: 2.5em;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.25;
  text-overflow: ellipsis;
  font-weight: normal;
  font-size: 1.8rem
}

.dialog-header {
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  flex-direction: column;
  flex-shrink: 0
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
  font-size: 1.3rem;
  color: #0f0f0f;
  border: none;
  min-width: 250px;
  max-width: 356px;
  box-shadow: 0 0 24px 12px rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  background-color: #fff
}

.dialog-container {
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
  padding: 0 env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)
}
`;
    this.wrapper = wrapper;
    this.shadowRoot.append(style, wrapper);
  }




  connectedCallback() {
    this.wrapper.innerHTML = `<div class="dialog-container">
  <div class="dialog">
    <div class="dialog-header">
      <h2 bind="header">${this.getAttribute("title") || '询问'}</h2>
    </div>
    <div class="dialog-body">
      <slot></slot>
    </div>
    <div class="dialog-buttons">
      <div class="btn close">
        取消
      </div>
      <div class="btn submit" style="color: #909090">
        继续
      </div>
    </div>
  </div>
  <div  class="modern-overlay close">
  </div>
</div>`;
    this.wrapper.querySelectorAll('.close')
      .forEach(element => {
        element.addEventListener('click', () => {
          this.remove();
        })
      });
    this.wrapper.querySelector('.submit').addEventListener('click', () => {
      this.remove();
      this.dispatchEvent(new CustomEvent('submit'));
    })
  }

  static get observedAttributes() {
    return ['title'];
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (attrName === 'title') {
      this.header.textContent = newVal;
    }
  }
}

customElements.define('custom-dialog', CustomDialog);
