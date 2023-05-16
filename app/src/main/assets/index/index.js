const baseUri = window.location.host === "127.0.0.1:5500" ? "http://192.168.8.55:3000" : "";



function onItemClick(evt) {
    const path = evt.currentTarget.dataset.path;

    if ( evt.currentTarget.dataset.isdirectory === "true") {

        //const url = new URL(window.location);
        //url.searchParams.set('path', path);
        window.history.pushState({}, '', `?path=${encodeURIComponent(path)}`);
        render(path);
        return;
    }


    if (path.endsWith(".mp3")) {
        window.location = `/music/music.html?path=${encodeURIComponent(path)}`
        return;
    }
    if (openVideoFile(path)) {
        return
    }
    if (path.endsWith(".srt")) {
        window.location = `/srt?path=${encodeURIComponent(path)}`
    }
    // else if (evt.detail.path.endsWith(".md")) {
    //     window.location = `/markdown?path=${encodeURIComponent(evt.detail.path)}`
    // }
    else {
        if ((/\.(?:pdf|epub|apk)$/.test(path)) && (typeof NativeAndroid !== 'undefined')) {
            NativeAndroid.openFile(path);
            return
        }
        window.location = `${baseUri}/api/file?path=${encodeURIComponent(path)}`
    }


    // detail = evt.detail;
    // showContextMenu(detail)

}
function openVideoFile(path) {
    if (/\.(?:mp4|m4a|v)$/.test(path) || substringAfterLast(decodeURIComponent(path), "/").indexOf(".") === -1) {
        window.location = `/video/video.html?path=${path}`
        return true;
    }
    return false;
}

////////////////////////////////////////////////////////////////
window.addEventListener("popstate", function (e) {
    window.location = location;
});

////////////////////////////////////////////////////////////////
bind();
initializeDropZone();
render();
