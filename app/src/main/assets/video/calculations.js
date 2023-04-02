(() => {
    class CustomTimePicker extends HTMLElement {

        constructor() {
            super();
            this.attachShadow({
                mode: 'open'
            });
            const wrapper = document.createElement("div");
            wrapper.setAttribute("class", "wrapper");
            const style = document.createElement('style');
            style.textContent = `
                .wrapper{
                    width:100%;
                    height:56px;
                    background:red;
                    color:#fff;
                    text-align:center;
                    line-height:56px;
                }
                `;
            this.wrapper = wrapper;
            this.shadowRoot.append(style, wrapper);
        }

        submit() {
            this.dispatchEvent(new CustomEvent('submit', {
                detail: this.number
            }));
        }

        set min(value) {
            this._min = value
            this.number = value;
            this.wrapper.textContent = formatDuration(this.number);
        }

        set max(value) {
            this._max = value
        }

        formatDuration(ms) {
            if (isNaN(ms)) return '0:00';
            if (ms < 0) ms = -ms;
            const time = {
                hour: Math.floor(ms / 3600) % 24,
                minute: Math.floor(ms / 60) % 60,
                second: Math.floor(ms) % 60,
            };
            return Object.entries(time)
                .filter((val, index) => index || val[1])
                .map(val => (val[1] + '').padStart(2, '0'))
                .join(':');
        }

        connectedCallback() {
            this.number = 1;
            this.wrapper.textContent = formatDuration(this.number);
            this.x = 0;
            this.wrapper.addEventListener('touchstart', evt => {
                this.x = evt.touches[0].pageX;
            })
            this.wrapper.addEventListener('touchmove', evt => {
                const diffX = evt.touches[0].pageX - this.x;
                console.log(this._max)
                if (diffX > 0) {
                    if (this.number < this._max)
                        this.number++;
                } else {
                    if (this.number > this._min)
                        this.number--;
                }
                this.wrapper.textContent = formatDuration(this.number);
                this.submit();
            })
            this.wrapper.addEventListener('touchend', evt => {
                this.x = 0;
            })
        }

        static get observedAttributes() {
            return ['title'];
        }

        attributeChangedCallback(name, oldValue, newValue) {
        }
    }

    customElements.define('custom-time-picker', CustomTimePicker);

})();
function formatDuration(ms) {
    if (isNaN(ms)) return '0:00';
    if (ms < 0) ms = -ms;
    const time = {
        hour: Math.floor(ms / 3600) % 24,
        minute: Math.floor(ms / 60) % 60,
        second: Math.floor(ms) % 60,
    };
    return Object.entries(time)
        .filter((val, index) => index || val[1])
        .map(val => (val[1] + '').padStart(2, '0'))
        .join(':');
}