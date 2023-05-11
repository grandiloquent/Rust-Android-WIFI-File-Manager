const baseUri = window.location.host === "127.0.0.1:5500" ? "http://192.168.8.55:3000" : "";

async function loadData(path) {
    const res = await fetch(`${baseUri}/api/files?path=${path || ''}`);
    return res.json();
}
async function render(path) {
    setDocumentTitle(path);
    path = path || new URL(window.location).searchParams.get("path");
    const res = await loadData(path);
    this.wrapper.innerHTML = res.sort((x, y) => {
        if (x.is_directory !== y.is_directory) if (x.is_directory) return -1; else return 1;
        return x.path.localeCompare(y.path)
    })
        .map(x => {
            return `<custom-item bind @submit="submit" ${x.is_directory ? 'folder' : ''} title="${substringAfterLast(x.path, '/')}" path="${encodeURIComponent(x.path)}" isdirectory="${x.is_directory}"></custom-item>`
        }).join('');
    bind(this.wrapper);
}
function setDocumentTitle(path) {
    if (!path) return;
    document.title = substringAfterLast(decodeURIComponent(path), "/")
}

function submit(evt) {
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
                window.location = `/api/file?path=${encodedPath}`
            }
        }
    } else {
        detail = evt.detail;
        showContextMenu(detail)
    }
}
////////////////////////////////////////////////////////////////
window.addEventListener("popstate", function (e) {
    window.location = location;
});
document.addEventListener("DOMContentLoaded", evt => {
    var dropZone = document.querySelector('body');
    dropZone.addEventListener('dragover', function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy'
    });
    dropZone.addEventListener('drop', function (e) {
        e.stopPropagation();
        e.preventDefault();
        uploadFiles(e.dataTransfer.files)
    });
    async function uploadFiles(files) {
        document.querySelector('.dialog').className = 'dialog dialog-show';
        const dialogContext = document.querySelector('.dialog-content span');
        const length = files.length;
        let i = 1;
        for (let file of files) {
            dialogContext.textContent = `正在上传 (${i++}/${length}) ${file.name} ...`;
            const formData = new FormData;
            let path = new URL(location.href).searchParams.get('path') || "/storage/emulated/0";
            formData.append('path', path + "/" + file.name);
            formData.append('file', file, path + "/" + file.name);
            try {
                await fetch(`${baseUri}/upload`, {
                    method: "POST",
                    body: formData
                }).then(res => console.log(res))
            } catch (e) {
            }
        }
        document.querySelector('.dialog').className = 'dialog'
    }
});

////////////////////////////////////////////////////////////////
bind();
render();