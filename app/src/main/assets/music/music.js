const baseUri = window.location.host === "127.0.0.1:5500" ? "http://192.168.8.55:3000" : "";
const path = new URL(window.location).searchParams.get("path") || "%2Fstorage%2Femulated%2F0%2FMusics%2FMP3%2F%E9%98%BF%E6%82%A0%E6%82%A0-%E4%B8%80%E6%9B%B2%E7%9B%B8%E6%80%9D.mp3";
async function loadMusicFiles() {
    let dir = substringBeforeLast(decodeURIComponent(path), "/");
    const res = await fetch(`${baseUri}/api/files?path=${encodeURIComponent(dir)}`);
    return res.json();
}
async function render() {
    const files = (await loadMusicFiles())
        .filter(x => !x.is_directory && x.path.endsWith(".mp3"))
        .sort((x, y) => x.path.localeCompare(y.path));
    window.files = files;
    const buf = [];
    for (const iterator of files) {
        buf.push(`<div class="item-wrapper" data-path="${iterator.path}">
<div class="item-left">
</div>
<div class="item-main">
    <div class="item-title">${substringBeforeLast(substringAfterLast(iterator.path, "/"), ".")}</div>
    <div class="item-subtitle"></div>
</div>
<div class="item-right"></div>
</div>`);
    }
    wrapper.innerHTML = buf.join('');
    bindPlayEvent();
}
async function bindPlayEvent() {
    // https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery/buffering_seeking_time_ranges
    audio.addEventListener('timeupdate', evt => {
        primaryProgress.style.transform = `scaleX(${audio.currentTime / audio.duration

            })`;
    });
    audio.addEventListener('play', evt => {
        playPauseButton.querySelector('path').setAttribute('d', 'M9,19H7V5H9ZM17,5H15V19h2Z');
    });
    audio.addEventListener('pause', evt => {
        playPauseButton.querySelector('path').setAttribute('d', 'M6,4l12,8L6,20V4z');
    })
    audio.addEventListener('progress', evt => {
        const duration = audio.duration;
        if (duration > 0) {
            for (let i = 0; i < audio.buffered.length; i++) {
                if (
                    audio.buffered.start(audio.buffered.length - 1 - i) <
                    audio.currentTime
                ) {
                    secondaryProgress.style.transform = `scaleX(${(audio.buffered.end(audio.buffered.length - 1 - i)) / duration
                        })`;
                    break;
                }
            }
        }
    });

    searchIndex(path);
    audio.src = `${baseUri}/api/file?path=${path}`;
    title.textContent = substringAfterLast(decodeURIComponent(path), "/");

    document.querySelectorAll('.item-wrapper').forEach(itemWrapper => {
        itemWrapper.addEventListener('click', evt => {
            searchIndex(evt.currentTarget.dataset.path)
            playMusic(evt.currentTarget.dataset.path, evt.currentTarget.textContent)
        });
    });
    playPauseButton.addEventListener('click', evt => {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    });
    nextButton.addEventListener('click', evt => {
        let index = window.index || (window.index = 0);
        if (index + 1 < window.files.length) {
            window.index++;

        } else {
            window.index = 0;
        }
        playMusic(window.files[window.index].path,
            substringAfterLast(window.files[window.index].path, '/'));
    });
    previousButton.addEventListener('click', evt => {
        let index = window.index || (window.index = 0);
        if (index - 1 > -1) {
            window.index--;

        } else {
            window.index = 0;
        }
        playMusic(window.files[window.index].path,
            substringAfterLast(window.files[window.index].path, '/'));
    });

}
async function playMusic(path, text) {
    audio.src = `${baseUri}/api/file?path=${path
        }`
    title.textContent = text;
    audio.play();
}
async function searchIndex(path) {
    for (let index = 0; index < window.files.length; index++) {
        const element = window.files[index];
        if (element.path === path) {
            window.index = index;
            break;
        }
    }

}
////////////////////////////////////////
const wrapper = document.querySelector('.wrapper');
const title = document.querySelector('.title');
const primaryProgress = document.querySelector('.primary-progress');
const secondaryProgress = document.querySelector('.secondary-progress');
const playPauseButton = document.querySelector('.play-pause-button');
const nextButton = document.querySelector('.next-button');
const audio = document.querySelector('audio');
const previousButton = document.querySelector('.previous-button');


render();
