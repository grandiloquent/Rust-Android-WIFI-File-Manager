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

function progress(video, loaded) {
    return evt => {
        if (video.buffered.length) {
            loaded.style.width = `${video.buffered.end(0) / video.duration * 100}%`;
        }
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
async function loadVideoList() {
    const res = await fetch(`${baseUri}/api/files?path=${encodeURIComponent(substringBeforeLast(path, '/'))}`);
    const videos = await res.json();
    return videos.filter(x => !x.is_directory &&
        re.test(x.path))
        .sort((x1, x2) => {
            return x1.path.localeCompare(x2.path);
        })
}

async function renderVideoList() {
    if (videoList.dataset.loaded !== 'true') {

        const buf = [];
        for (let index = 0; index < videos.length; index++) {
            const element = videos[index];
            buf.push(`<div class="media-item" data-path="${element.path}">
        <div class="video-thumbnail-container-large">
            <div class="video-thumbnail-bg"></div>
            <img class="core-image" src="${baseUri}/api/file?path=${encodeURIComponent(substringBeforeLast(element.path, "/") + "/.images/" + substringAfterLast(element.path, "/"))}">
        </div>
        <div class="details">
            <div class="media-channel"></div>
            <div class="media-item-info">
                <div class="media-item-metadata">
                    <div class="media-item-headline">
                        ${substringAfterLast(element.path, "/")}
                    </div>
                    <div class="badge-and-byline-renderer">
                        <div class="badge-and-byline-item-byline"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>`)
        }

        videoList.innerHTML = buf.join('');
        videoList.dataset.loaded = 'true';
    }
    videoList.style.display = 'block';

    document.querySelectorAll('.media-item').forEach(mediaItem => {
        mediaItem.addEventListener('click', evt => {
            videoList.style.display = 'none';
            video.src = `${baseUri}/api/file?path=${encodeURIComponent(evt.currentTarget.dataset.path)}`;
            video.play();
        });
    })
}
async function formatFilenames(path) {
    const res = await fetch(`${baseUri}/api/files/rename?path=${path}`)
}
async function playWithIndex() {
    const src = videos[index].path;
    document.title = substringAfterLast(src, "/");
    video.load();
    video.src = `${baseUri}/api/file?path=${encodeURIComponent(src)}`;
    video.play();
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
//////////////////////////////////////////////////////////////////
let timer;
const middle = document.getElementById('middle');
const bottom = document.getElementById('bottom');
const toast = document.getElementById('toast');
const baseUri = window.location.host === "127.0.0.1:5500" ? "http://192.168.8.55:3000" : "";
const searchParams = new URL(window.location).searchParams;
const path = searchParams.get("path");
const re = new RegExp(/\.(?:v|mp4|m4a)$/);
const videoList = document.querySelector('.video-list');
const video = document.querySelector('video');
let videos;
let index;

async function initialize() {

    toast.setAttribute('message', path);
    const loaded = document.querySelector('.progress_bar_loaded');
    video.src = `${baseUri}/api/file?path=${path}`
    video.addEventListener('durationchange', durationchange(video, path));
    video.addEventListener('timeupdate', timeupdate(video));
    video.addEventListener('progress', progress(video, loaded));
    video.addEventListener('play', play());
    video.addEventListener('pause', pause());


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
    await formatFilenames(substringBeforeLast(path, "/"));
    videos = await loadVideoList();
    for (let v = 0; v < videos.length; v++) {
        const element = videos[v];
        if (element.path == path) {
            index = v;

            break;
        }
    }
}
initialize();


const fullscreen = document.querySelector('.fullscreen');
fullscreen.addEventListener('click', evt => {

});

if (typeof NativeAndroid !== 'undefined') {
    NativeAndroid.generateVideoThumbnails(substringBeforeLast(path, "/"));
}
const forward_10 = document.querySelector('.forward_10');
forward_10.addEventListener('click', evt => {
    startTimer();
    if (video.currentTime + 10 <= video.duration)
        video.currentTime = video.currentTime + 10;
});
const replay_10 = document.querySelector('.replay_10');
replay_10.addEventListener('click', evt => {
    startTimer();
    if (video.currentTime - 10 > 0)
        video.currentTime = video.currentTime - 10;
});
const moveGroup = document.querySelector('.move_group');
moveGroup.addEventListener('click', async evt => {
    video.pause();
    const dir = substringBeforeLast(path, "/") + "/Recycled";
    await fetch(`${baseUri}/api/file/new_dir?path=${encodeURIComponent(dir)}`);
    const src = videos[index].path;
    await fetch(`${baseUri}/api/file/rename?path=${encodeURIComponent(src)}&dst=${encodeURIComponent(dir + "/" + substringAfterLast(src, "/"))}`)
    if (videos.length === 1) {
        return;
    }
    videos.splice(index, 1);
    if (index === videos.length) {
        if (index === 0) {
            return;
        }
        index--;
    }
    playWithIndex();
});
const playlistPlay = document.querySelector('.playlist_play');
playlistPlay.addEventListener('click', evt => {
    renderVideoList();
});


document.getElementById('back').addEventListener('click', evt => {
    if (index > 0) {
        index--;
    }
    playWithIndex();
})
document.getElementById('forward').addEventListener('click', evt => {
    if (index + 1 < videos.length) {
        index++;
    }
    playWithIndex();
})
const shuffle = document.querySelector('.shuffle');
shuffle.addEventListener('click', evt => {
    index = getRandomInt(0, videos.length);
    playWithIndex();
});
const contentCopy = document.querySelector('#content_copy');
contentCopy.addEventListener('click', evt => {
    writeText(video.currentTime.toFixed(3));
});
const fps = (localStorage.getItem('fps') && parseFloat(localStorage.getItem('fps'))) || 29.97;
document.getElementById('forward_10')
    .addEventListener('click', evt => {
        video.currentTime += 1 / fps;
    });
document.getElementById('replay_10')
    .addEventListener('click', evt => {
        video.currentTime -= 1 / fps;
    });

document.getElementById('30fps_select')
    .addEventListener('click', evt => {
        const dialog = document.createElement('custom-dialog');
        dialog.title = "设置帧率";
        const div = document.createElement('input');
        div.type = 'text';
        div.style.width = "100%";
        div.value = fps;
        dialog.appendChild(div);
        dialog.addEventListener('submit', async () => {
            if (parseFloat(div.value))
                localStorage.setItem('fps', div.value)
        });
        document.body.appendChild(dialog);
    });
document.getElementById('video_file')
    .addEventListener('click', evt => {
        const url = new URL(video.src);
        writeText(url.searchParams('path'));
    });