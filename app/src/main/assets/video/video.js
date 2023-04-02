function appendSubtitle(video) {
    //document.querySelectorAll('track').forEach(x => x.remove())
    const track = document.createElement('track');
    var tracks = video.textTracks;
    var numTracks = tracks.length;
    for (var i = numTracks - 1; i >= 0; i--)
        video.textTracks[i].mode = "disabled";
    track.src = substringBeforeLast(video.src, ".") + ".srt";
    track.default = true;
    video.appendChild(track);
}

function bind(elememnt) {
    (elememnt || document).querySelectorAll('[bind]').forEach(element => {
        if (element.getAttribute('bind')) {
            window[element.getAttribute('bind')] = element;
        }
        [...element.attributes].filter(attr => attr.nodeName.startsWith('@')).forEach(attr => {
            if (!attr.value) return;
            element.addEventListener(attr.nodeName.slice(1), evt => {
                window[attr.value](evt);
            });
        });
    })
}

function calculateLoadedPercent(video) {
    if (!video.buffered.length) {
        return '0';
    }
    return (video.buffered.end(0) / video.duration) * 100 + '%';
}

function calculateProgressPercent(video) {
    return ((video.currentTime / video.duration) * 100).toFixed(2) + '%';
}

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

function getCurrentVideoFileName() {
    let s = substringAfterLast(decodeURIComponent(video.src), '/');
    s = substringAfterLast(s, '\\')
    return substringBefore(s, "&");
}

function getIndexOfCurrentPlayback() {
    const name = getCurrentVideoFileName();
    return items.indexOf(items.filter(x => x.path.endsWith(`\\${name}`))[0]);
}

function getPath() {
    return new URL(document.URL).searchParams.get('path');
}

async function loadData() {
    if (!items) {
        const path = substringBeforeLast(decodeURIComponent(new URL(document.URL).searchParams.get('path')), '\\');
       console.log(path)
        const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
        items = await res.json();
        items = items.filter(x => {
            return !x.isDirectory && x.path.endsWith('.mp4');
        })
    }
}

function onBottom(evt) {
    evt.stopPropagation();
    if (evt.clientX > left || evt.clientX <= width + left) {
        let precent = (evt.clientX - left) / width;
        precent = Math.max(precent, 0);
        precent = Math.min(precent, 1);
        video.currentTime = video.duration * precent;
    }
}

function onDownload(evt) {
    evt.stopPropagation();
    renderData();
}

function onDurationChange() {
    customTimePicker.min = video.currentTime;
    customTimePicker.max = video.duration;
    if (window.innerWidth < window.innerHeight) {
        const ratio = video.videoWidth / window.innerWidth;
        layout.style.height = `${video.videoHeight / ratio}px`;
    } else {
        const ratio = video.videoHeight / window.innerHeight;
        layout.style.height = `${video.videoHeight / ratio}px`;
    }
    progressBarPlayed.style.width = calculateProgressPercent(video);
    timeSecond.textContent = formatDuration(video.duration);
}

function onEnded() {
    playIndexedVideo(true)
}

function onFullscreen(evt) {
    evt.stopPropagation();
    toggleFullScreen();
}

function onLayout(evt) {
    middle.style.display = 'flex';
    bottom.style.display = 'flex';
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
        middle.style.display = 'none';
        bottom.style.display = 'none';
    }, 5000)
}

function onNext(evt) {
    evt.stopPropagation();
    playIndexedVideo(true)
}

function onPause() {
    buttonPlay.querySelector('path').setAttribute('d', 'M6,4l12,8L6,20V4z');
}

function onPlay(evt) {
    evt.stopPropagation();
    scheduleHide();
    buttonPlay.querySelector('path').setAttribute('d', 'M9,19H7V5H9ZM17,5H15V19h2Z');
}

function onPlayButton(evt) {
    evt.stopPropagation();
    if (video.paused) {
        video.play();

    } else {
        video.pause();
    }
}

function scheduleHide() {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
        middle.style.display = 'none';
        bottom.style.display = 'none';
    }, 5000)
}

function onPrevious(evt) {
    evt.stopPropagation();
    playIndexedVideo(false)
}

function onProgress() {
    progressBarLoaded.style.width = calculateLoadedPercent(video);
}

function onTimeupdate() {
    timeFirst.textContent = formatDuration(video.currentTime);
    const width = calculateProgressPercent(video);
    progressBarPlayed.style.width = width
    progressBarPlayhead.style.left = width
}

async function playIndexedVideo(next) {
    await loadData();
    let index = getIndexOfCurrentPlayback();
    console.log(index)
    if (next && index + 1 < items.length) {
        index++;
        playVideoAtSpecifiedIndex(index)
    }
    if (!next && index > 0) {
        index--
        playVideoAtSpecifiedIndex(index)
    }
}

async function playVideoAtSpecifiedIndex(index) {
    const v = items[index];
    video.src = `/api/file?path=${encodeURIComponent(v.path)}`;
    appendSubtitle(video);
    await video.play();
    document.title = substringAfterLast(v.path, "\\");
    title.textContent = substringAfterLast(v.path, "\\");
    toast.setAttribute('message', title.textContent);
}

async function renderData() {
    await loadData();

    customBottomSheet.data = items.map((x, i) => {
        return {
            id: i,
            title: substringAfterLast(x.path, "\\")
        }
    });
    customBottomSheet.style.display = 'block';
}

function substringAfterLast(string, delimiter, missingDelimiterValue) {
    const index = string.lastIndexOf(delimiter);
    if (index === -1) {
        return missingDelimiterValue || string;
    } else {
        return string.substring(index + delimiter.length);
    }
}

function substringBefore(string, delimiter, missingDelimiterValue) {
    const index = string.indexOf(delimiter);
    if (index === -1) {
        return missingDelimiterValue || string;
    } else {
        return string.substring(0, index);
    }
}

function substringBeforeLast(string, delimiter, missingDelimiterValue) {
    const index = string.lastIndexOf(delimiter);
    if (index === -1) {
        return missingDelimiterValue || string;
    } else {
        return string.substring(0, index);
    }
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        layout.style.position = "fixed";
        layout.style.left = '0';
        layout.style.top = '0';
        layout.style.bottom = '0';
        layout.style.right = '0';
        layout.style.height = 'auto'
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            layout.style.position = "relative";
            const ratio = video.videoWidth / window.innerWidth;
            layout.style.height = `${video.videoHeight / ratio}px`;
        }
    }
}

function onCustomBottomSheetSubmit(evt) {
    customBottomSheet.style.display = 'none';
    playVideoAtSpecifiedIndex(parseInt(evt.detail.id))
}

function onCustomTimePickerSubmit(evt) {
    video.currentTime = evt.detail;
}


/*
https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
https://developer.mozilla.org/zh-CN/docs/Web/API/Fullscreen_API
*/