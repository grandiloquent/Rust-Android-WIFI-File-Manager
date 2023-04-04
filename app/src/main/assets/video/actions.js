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

    submit(e) {
        this.remove();
        this.dispatchEvent(new CustomEvent('submit'));
    }

    close() {
        this.remove();
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
        <div bind @click="close" class="btn">
          取消
        </div>
        <div bind @click="submit" class="btn" style="color: #909090">
          继续
        </div>
      </div>
    </div>
    <div bind @click="close" class="modern-overlay">
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
        })
        if (this.getAttribute('title'))
            this.header.textContent = this.getAttribute('title')
    }

    static get observedAttributes() {
        return ['title'];
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === 'title') {
            if (this.header) {
                this.header.textContent = newVal;
            }

        }
    }
}
customElements.define('custom-dialog', CustomDialog);
bind();

function onPlay(evt) {
    evt.stopPropagation();
    scheduleHide();
    play.querySelector('svg').setAttribute('viewBox', '104.23 34.94 74.91 88.23');
    play.querySelector('path').setAttribute('d', 'M113.411 123.175h12.94c6.103 0 9.13-3.027 9.13-9.13V44.073c0-5.86-3.027-8.936-9.13-9.131h-12.94c-6.103 0-9.18 3.027-9.18 9.13v69.971c-.146 6.104 2.881 9.131 9.18 9.131Zm43.604 0h12.939c6.104 0 9.18-3.027 9.18-9.13V44.073c0-5.86-3.076-9.131-9.18-9.131h-12.94c-6.103 0-9.18 3.027-9.18 9.13v69.971c0 6.104 2.93 9.131 9.18 9.131Z');
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();

    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        
        }
    }
}
function calculateProgressPercent(video) {
    return ((video.currentTime / video.duration) * 100).toFixed(2) + '%';
}

function onTimeupdate() {
    //timeFirst.textContent = formatDuration(video.currentTime);
    //const width = calculateProgressPercent(video);
    //progressBarPlayed.style.width = width
    //progressBarPlayhead.style.left = width
    const width= ((video.currentTime / video.duration) * 100);;
    range.style.setProperty("--progress",width+"%");
    range.value=width
    elapsed.textContent = formatDuration(video.currentTime);
}
function onProgress() {

}
function onPause() {
    play.querySelector('svg').setAttribute('viewBox', '102.69 30.35 87.5 97.51');
    play.querySelector('path').setAttribute('d', 'M113.428 127.863c2.588 0 5.03-.733 8.448-2.686l60.302-35.01c4.883-2.88 8.008-6.103 8.008-11.084 0-4.98-3.125-8.203-8.008-11.035l-60.302-35.01c-3.418-2.002-5.86-2.685-8.448-2.685-5.566 0-10.742 4.248-10.742 11.67v74.17c0 7.422 5.176 11.67 10.742 11.67Z');
}
function onDurationChange() {
    remaining.textContent = formatDuration(video.duration);
}
function onSeek(evt) {
    video.currentTime = video.duration * (parseInt(evt.target.value) / 100);
}
function onBack() {
    video.currentTime = video.currentTime - 10;
    scheduleHide();
}
function onForward() {
    video.currentTime = video.currentTime + 10;
    scheduleHide();
}
function onEnded() {

}
let timer;
function scheduleHide() {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
        gradient.style.display = 'none';
        scrim.style.display = 'none';
    }, 3000)
}
videoContainer.addEventListener('click', evt => {
    gradient.removeAttribute('style');
    scrim.removeAttribute('style');
})

play.addEventListener('click', evt => {
    evt.stopPropagation();
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }

})
function onFullscreen(evt) {
    evt.stopPropagation();
    toggleFullScreen();
}
function onPlayVideo() {

    const dialog = document.createElement('custom-dialog');
    const div = document.createElement('div');
    dialog.setAttribute('title', "播放");
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

    dialog.addEventListener('submit', async evt => {
        start(key.value.trim())
    })
    document.body.appendChild(dialog);
}
function hmsToSecondsOnly(str) {
    var p = str.split(':'),
        s = 0, m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
}
function onSeekTo() {

    const dialog = document.createElement('custom-dialog');
    const div = document.createElement('div');
    dialog.setAttribute('title', "跳转");
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

    dialog.addEventListener('submit', async evt => {
        video.currentTime = hmsToSecondsOnly(key.value.trim())
    })
    document.body.appendChild(dialog);
}
function start(uri) {
    if (uri) {
        video.src = uri;
    } else {
        let path = new URL(window.location).searchParams.get('path');
        setTitle(substringAfterLast(path, "/"));
        if (path)
            video.src = `/api/file?path=${encodeURIComponent(path)}`
            appendSubtitle(video,path)
        }
    
}
function appendSubtitle(video,path) {
    //document.querySelectorAll('track').forEach(x => x.remove())
    const track = document.createElement('track');
    var tracks = video.textTracks;
    var numTracks = tracks.length;
    for (var i = numTracks - 1; i >= 0; i--)
        video.textTracks[i].mode = "disabled";
    track.src =`/subtitle?path=${encodeURIComponent(path+".srt")}`   
    track.default = true;
    video.appendChild(track);
}
start()
// layout.style.height = `${window.innerWidth * 0.5625}px`;
// let timer, items;

// video.preload = "auto"
// let path = getPath();
// video.src = `/api/file?path=${encodeURIComponent(path)}&isDir=0`;
// document.title = substringAfterLast(path, '\\')
// appendSubtitle(video);


// const width = progressBarBackground.getBoundingClientRect().width;
// const left = parseInt(window.getComputedStyle(bottom, null).getPropertyValue('padding-left'));

