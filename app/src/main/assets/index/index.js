async function loadData(path) {
    // https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState
    //window.history.pushState(null, null, `?path=${encodeURIComponent(path)}`);


    const res = await fetch(`/api/files?path=${path || ''}`);
    return res.json();
}


async function onDialogSubmit() {
    const dst = input.value.trim();
    if (!dst) return;
    const path = this.dialog.dataset.path || new URL(window.location).searchParams.get("path");
    this.dialog.dataset.path = '';
    const url = new URL(`${window.origin}${this.dialog.dataset.action}`);
    url.searchParams.set("path", (path || '/storage/emulated/0') + "/" + dst);
    await fetch(url)
    location.reload();
}

function onNewFile() {
    this.dialog.style.display = 'block';
    this.dialog.setAttribute('title', '新建文件');
    this.dialog.dataset.action = "/api/file/new_file";
}

function onNewFolder() {
    this.dialog.style.display = 'block';
    this.dialog.setAttribute('title', '新建文件夹');
    this.dialog.dataset.action = "/api/file/new_dir";
}

function substringAfterLast(string, delimiter, missingDelimiterValue) {
    const index = string.lastIndexOf(delimiter);
    if (index === -1) {
        return missingDelimiterValue || string;
    } else {
        return string.substring(index + delimiter.length);
    }
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


async function onMove() {
    launchMoveDialog();
}

async function onDelete() {
    launchDeleteDialog();
}

///////////////////////////
bind();

render();


window.addEventListener("popstate", function (e) {

    let path = new URL(location).searchParams.get('path');
    // if (path)
    //     location = `?path=${path}`;
    window.location = location;
    console.log(decodeURIComponent(path))
    //location.reload();
});
let detail;

document.addEventListener('keydown', evt => {
    console.log(evt.key)
    if (evt.key === 'Enter') {
        evt.preventDefault();
        fetch(`/api/cmd?q=explorer ${new URL(location).searchParams.get('path')}`)
    }
})

/*
(() => {
    const extensions =
        [...new Set(['c', 'cc', 'cpp', 'cs', 'css', 'h', 'html', 'java', 'js', 'md', 'sql', 'srt', 'txt', 'vtt',
            'rs', 'gradle', 'json', 'java', 'toml', 'conf', 'service', 'jsx', 'cmd', 'gitignore', 'bat', 'properties','xml'])].sort();
    console.log(extensions.join("|"))
})();*/
