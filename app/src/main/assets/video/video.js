function adjustSize(video) {
    if (video.videoWidth > 0) {
        const w = Math.min(window.outerWidth, window.innerWidth);
        const h = Math.min(window.outerHeight, window.innerHeight);
        let ratio = Math.min(w / video.videoWidth, h / video.videoHeight);
        let height = video.videoHeight * ratio
        let width = video.videoWidth * ratio;
        video.style.width = `${width}px`;
        video.style.height = `${height}px`;
        video.style.left = `${(w - width) / 2}px`;
        video.style.top = `${(h - height) / 2}px`
    }
}
function durationchange(video, url) {
    const second = document.getElementById('second');
    return evt => {
        if (video.duration) {
            second.textContent = formatDuration(video.duration);
            fetch(`${getBaseAddress()}/video/duration?url=${encodeURIComponent(url)}&duration=${video.duration | 0}`)
        }
        adjustSize(video);
    }
}

async function getUrl(baseUri, url) {
    const res = await fetch(`${baseUri}/video/fetch?url=${encodeURIComponent(url)}`);
    if (res.status === 204) {
        throw new Error(`无法获取视频地址`);
    }
    return res.json();
}
function initializeSeek(video, first) {
    // const width = video.getBoundingClientRect().width;
    // let right, start, dif = 0, timer;
    // video.addEventListener('touchstart', evt => {
    //     video.pause();
    //     start = video.currentTime;
    //     right = (evt.touches[0].clientX >= width / 2);
    //     clearInterval(timer);
    //     timer = setInterval(() => {
    //         dif += 1 * (right ? 1 : -1);
    //         first.textContent = formatDuration(dif + start);
    //         startTimer();
    //     }, 100);
    // })
    // video.addEventListener('touchend', evt => {
    //     clearInterval(timer);
    //     console.log(dif + start)
    //     video.currentTime = dif + start;
    //     video.play();
    // })

    document.getElementById('back').addEventListener('click', evt => {
        startTimer();
        if (video.currentTime - 30 > 0)
            video.currentTime = video.currentTime - 30;
    })
    document.getElementById('forward').addEventListener('click', evt => {
        startTimer();
        if (video.currentTime + 30 <= video.duration)
            video.currentTime = video.currentTime + 30;
    })
}
function progress(video, loaded) {
    return evt => {
        if (video.buffered.length) {
            loaded.style.width = `${video.buffered.end(0) / video.duration * 100}%`;
        }
    }
}

function setSrc(video, src) {
    if (src.indexOf(".m3u8") !== -1 && !video.canPlayType('application/vnd.apple.mpegurl') && Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(
            video
        );
    } else {
        video.src = src;
    }
}
function timeupdate(video) {
    const first = document.getElementById('first');
    const progressBarPlayed = document.querySelector('.progress_bar_played');
    const progressBarPlayheadWrapper = document.querySelector('.progress_bar_playhead_wrapper');
    return evt => {
        if (video.currentTime) {
            first.textContent = formatDuration(video.currentTime);
            const ratio = video.currentTime / video.duration;
            progressBarPlayed.style.width = `${ratio * 100}%`;
            progressBarPlayheadWrapper.style.marginLeft = `${ratio * 100}%`;
        }
    }
}
let timer;
const middle = document.getElementById('middle');
const bottom = document.getElementById('bottom');
const toast = document.getElementById('toast');

async function initialize() {
    const searchParams = new URL(window.location).searchParams;
    const url = searchParams.get("url");
    let videoInformation;
    try {
        videoInformation = await getUrl(getBaseAddress(), url);

    } catch (error) {
        toast.setAttribute('message', error.message);
        return;
    }
    document.title = videoInformation.title;
    toast.setAttribute('message', videoInformation.title);
    const video = document.querySelector('video');

    const loaded = document.querySelector('.progress_bar_loaded');
    const download = document.querySelector('.download');
    download.addEventListener('click', evt => {
        writeText(videoInformation.file);
        toast.setAttribute('message', "已成功复制视频地址");
    });
    setSrc(video, videoInformation.file);
    video.addEventListener('durationchange', durationchange(video, url));
    video.addEventListener('timeupdate', timeupdate(video));
    video.addEventListener('progress', progress(video, loaded));
    video.addEventListener('play', play());
    video.addEventListener('pause', pause());

    initializeSeek(video, first);
    initializeSeekDialog(video);
    document.getElementById('play').addEventListener('click', evt => {
        if (video.paused) {
            video.play();
            startTimer();
        } else {
            video.pause();
        }
    });
    video.addEventListener('click', evt => {
        middle.style.display = "flex";
        bottom.style.display = "flex";
        startTimer();
    });
}
function play() {
    return evt => {
        document.querySelector('#play path').setAttribute('d', 'M9,19H7V5H9ZM17,5H15V19h2Z');
    }
}
function pause() {
    return evt => {
        document.querySelector('#play path').setAttribute('d', ' M6,4l12,8L6,20V4z');
    }
}
initialize();

function startTimer() {
    if (timer)
        clearTimeout(timer);
    timer = setTimeout(() => {
        middle.style.display = "none";
        bottom.style.display = "none";
    }, 10000);
    return timer;
}

function initializeSeekDialog(video) {
    const dialogContainer = document.querySelector('.dialog-container');
    dialogContainer.querySelector('.dialog-overlay')
        .addEventListener('click', evt => {
            dialogContainer.style.display = 'none';
        });
    dialogContainer.querySelector('.dialog-buttons>div')
        .addEventListener('click', evt => {
            const values = /((\d+)h)?((\d+)m)?(\d+)s/.exec(dialogContainer.querySelector('input').value);
            let currentTime = 0;
            if (values[2]) {
                currentTime += parseInt(values[2]) * 3600;
            }
            if (values[4]) {
                currentTime += parseInt(values[4]) * 60;
            }
            if (values[5]) {
                currentTime += parseInt(values[5]);
            }
            video.currentTime = currentTime;
            dialogContainer.style.display = 'none';
        });

    document.querySelector('.playback_speed')
        .addEventListener('click', evt => {
            const step = (video.duration / 10) | 0;
            let seekTo = video.currentTime + step < video.duration;
            seekTo = Math.min(seekTo, video.duration);
            dialogContainer.querySelector('input').value = formatSeconds(seekTo);
            dialogContainer.style.display = 'flex';
        })
}
function formatSeconds(value) {
    const seconds = value % 60;
    const minutes = value / 60 | 10;
    return `${minutes}m${seconds}s`;
}