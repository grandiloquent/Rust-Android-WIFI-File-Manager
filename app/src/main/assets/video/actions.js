bind();
video.src = "http://192.168.8.55:3000/api/file?path=%2Fstorage%2Femulated%2F0%2F.others/2.mp4"

function onPlay(evt) {
    evt.stopPropagation();
    //scheduleHide();
    //play.querySelector('path').setAttribute('d', 'M9,19H7V5H9ZM17,5H15V19h2Z');
}
function onTimeupdate() {
    //timeFirst.textContent = formatDuration(video.currentTime);
    //const width = calculateProgressPercent(video);
    //progressBarPlayed.style.width = width
    //progressBarPlayhead.style.left = width
    elapsed.textContent = formatDuration(video.currentTime);
}
function onProgress() {

}
function onPause() {

}
function onDurationChange() {
    remaining.textContent = formatDuration(video.duration);
}
function onSeek(evt) {
    console.log(video.duration * parseInt(evt.target.value) / 100);
    video.currentTime = video.duration * (parseInt(evt.target.value) / 100);
}
function onEnded() {

}
function onPlay() {

}
play.addEventListener('click', evt => {
    video.play();
})
// layout.style.height = `${window.innerWidth * 0.5625}px`;
// let timer, items;

// video.preload = "auto"
// let path = getPath();
// video.src = `/api/file?path=${encodeURIComponent(path)}&isDir=0`;
// document.title = substringAfterLast(path, '\\')
// appendSubtitle(video);


// const width = progressBarBackground.getBoundingClientRect().width;
// const left = parseInt(window.getComputedStyle(bottom, null).getPropertyValue('padding-left'));

