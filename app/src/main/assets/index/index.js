const baseUri = window.location.host === "127.0.0.1:5500" ? "http://192.168.8.55:3000" : "";



function onItemClick(evt) {
    const encodedPath = evt.detail.path;
    if (evt.detail.id === '0') {
        if (evt.detail.isDirectory === "true") {

            const url = new URL(window.location);
            //url.searchParams.set('path', path);
            window.history.pushState({}, '', `?path=${encodedPath}`);
            render(evt.detail.path);
        } else {
            if (openVideoFile(evt.detail.path)) {
                return
            }
            if (evt.detail.path.endsWith(".srt")) {
                window.location = `/srt?path=${encodeURIComponent(evt.detail.path)}`
            }
            // else if (evt.detail.path.endsWith(".md")) {
            //     window.location = `/markdown?path=${encodeURIComponent(evt.detail.path)}`
            // }
            else if (decodeURIComponent(evt.detail.path).indexOf("/Books/") === -1 && /\.(?:bat|c|cc|cmd|conf|cpp|cs|css|gitignore|gradle|h|html|java|js|json|jsx|md|properties|rs|service|sql|srt|toml|txt|vtt|xml|au3)$/.test(evt.detail.path)) {
                window.open(`/editor?path=${encodedPath}`)
            } else {
                if ((/\.(?:pdf|epub|apk)$/.test(encodedPath)) && (typeof NativeAndroid !== 'undefined')) {
                    NativeAndroid.openFile(encodedPath);
                    return
                }
                window.location = `${baseUri}/api/file?path=${encodedPath}`
            }
        }
    } else {
        detail = evt.detail;
        showContextMenu(detail)
    }
}
function openVideoFile(path) {
    if (/\.(?:mp4|m4a)$/.test(path) || substringAfterLast(decodeURIComponent(path), "/").indexOf(".") === -1) {
        window.location = `/video/video?path=${path}`
        return true;
    }
    return false;
}
function showContextMenu(detail) {
    const bottomSheet = document.createElement('custom-bottom-sheet');
    addContextMenuItem(bottomSheet, '删除', () => {
        bottomSheet.remove();
        deleteFile(detail);
    });
    document.body.appendChild(bottomSheet);
}
////////////////////////////////////////////////////////////////
window.addEventListener("popstate", function (e) {
    window.location = location;
});

////////////////////////////////////////////////////////////////
bind();
initializeDropZone();
render();
