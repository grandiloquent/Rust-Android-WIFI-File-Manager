
function openVideoFile(path) {
    if (/\.(?:mp4|m4a)$/.test(path) || substringAfterLast(decodeURIComponent(path), "/").indexOf(".") === -1) {
        window.location = `/video/video?path=${path}`
        return true;
    }
    return false;
}