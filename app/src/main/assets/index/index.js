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
    const url = new URL(`${window.origin}/api/file`);
    url.searchParams.set("path", path);
    url.searchParams.set("action", this.dialog.dataset.action);
    url.searchParams.set("dst", dst);
    await fetch(url)
    location.reload();
}

function onNewFile() {
    this.dialog.style.display = 'block';
    this.dialog.setAttribute('title', '新建文件');
    this.dialog.dataset.action = "1";
}

function onNewFolder() {
    this.dialog.style.display = 'block';
    this.dialog.setAttribute('title', '新建文件');
    this.dialog.dataset.action = "2";
}

function substringAfterLast(string, delimiter, missingDelimiterValue) {
    const index = string.lastIndexOf(delimiter);
    if (index === -1) {
        return missingDelimiterValue || string;
    } else {
        return string.substring(index + delimiter.length);
    }
}

async function render(path) {
    path = path || new URL(window.location).searchParams.get("path");
    document.title = substringAfterLast(decodeURIComponent(path), "\\")
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

function submit(evt) {
    const encodedPath = evt.detail.path;
    if (evt.detail.id === '0') {
        if (evt.detail.isDirectory === "true") {

            const url = new URL(window.location);
            //url.searchParams.set('path', path);
            window.history.pushState({}, '', `?path=${encodedPath}`);
            render(evt.detail.path);
        } else {
            if (/\.(?:mp4|m4a)$/.test(evt.detail.path)) {
                window.location = `/video?path=${encodedPath}`
            } else if (evt.detail.path.endsWith(".srt")) {
                window.location = `/srt?path=${encodeURIComponent(evt.detail.path)}`
            }
            // else if (evt.detail.path.endsWith(".md")) {
            //     window.location = `/markdown?path=${encodeURIComponent(evt.detail.path)}`
            // }
            else if (decodeURIComponent(evt.detail.path).indexOf("/Books/") === -1 && /\.(?:bat|c|cc|cmd|conf|cpp|cs|css|gitignore|gradle|h|html|java|js|json|jsx|md|properties|rs|service|sql|srt|toml|txt|vtt|xml|au3)$/.test(evt.detail.path)) {
                window.open(`/editor?path=${encodedPath}`)
            } else {
                window.location = `/api/file?path=${encodedPath}`
            }
        }
    } else {
        detail = evt.detail;
        const sheet = document.createElement('custom-context-bottom-sheet');

        document.body.appendChild(sheet);
        console.log(detail)
        if (detail.isDirectory !== "true" && (detail.path.endsWith(".zip")
            || detail.path.endsWith(".epub"))) {
            sheet.data = [
                "选定",
                "选定同类文件",
                "重命名",
                "解压"
            ]
        } else {
            sheet.data = [
                "选定",
                "选定同类文件",
                "重命名",
                "压缩"
            ]
        }
        sheet.addEventListener('submit', evt => {
            if (evt.detail === '选定') {
                insertPathLocalStorage(detail.path)
                customToast.setAttribute('message', '成功写入剪切板');
            } else if (evt.detail === '选定同类文件') {
                const f = new URL(window.location).searchParams.get("f") || ''
                const items = [...document.querySelectorAll('custom-item')];
                const item = items.filter(x => {
                    return x.getAttribute('path') === detail.path;
                })[0];
                if (item.getAttribute('isdirectory') === 'true') {
                    items.filter(x => {
                        return x.getAttribute('isdirectory') === 'true'
                            && (!f || (substringAfterLast(decodeURIComponent(x.getAttribute('path')), "\\").indexOf(f) !== -1))
                    }).forEach(x => {
                        insertPathLocalStorage(x.getAttribute('path'))
                    })
                } else {
                    const path = decodeURIComponent(item.getAttribute('path'));
                    if (substringAfterLast(path, "\\").lastIndexOf(".") !== -1) {
                        const extension = "." + substringAfterLast(path, ".");
                        items.filter(x => {
                            return x.getAttribute('isdirectory') === 'false' &&
                                substringAfterLast(x.getAttribute('path')).endsWith(extension)
                                && (!f || (substringAfterLast(decodeURIComponent(x.getAttribute('path')), "\\").indexOf(f) !== -1));
                        }).forEach(x => {
                            insertPathLocalStorage(x.getAttribute('path'))
                        })
                    } else {
                        items.filter(x => {
                            return x.getAttribute('is_directory') === 'false' &&
                                substringAfterLast(path, "\\").lastIndexOf(".") === -1
                                && (!f || (substringAfterLast(decodeURIComponent(x.getAttribute('path')), "\\").indexOf(f) !== -1));
                        }).forEach(x => {
                            insertPathLocalStorage(x.getAttribute('path'))
                        })
                    }

                }
                customToast.setAttribute('message', '成功写入剪切板');
            } else if (evt.detail === '解压') {
                fetch(`/api/zip?path=${detail.path}`)
            } else if (evt.detail === '重命名') {
                rename(detail.path)
            } 
        })
    }
}

function onFav() {
    fav.style.display = "block";
}

function onFavSubmit(evt) {

    let path;
    switch (evt.detail.id) {
        case `1`:
            path = "D:\\Books";
            break
        case `2`:
            path = "D:\\资源";
            break
        case `3`:
            path = "C:\\Users\\Administrator\\Desktop";
            break
        case `4`:
            path = "C:\\Users\\Administrator\\Downloads";
            break
        case '5':
            path = "D:\\Resources\\Videos"
            break;
    }
    const url = new URL(window.location);
    url.searchParams.set('path', path);
    window.history.pushState({}, '', url);
    window.location = url;
}

async function onMove() {
    launchMoveDialog();
}

async function onDelete() {
    launchDeleteDialog();
}

///////////////////////////
bind();
customElements.whenDefined('custom-bottom-sheet').then(() => {
    /*
    customBottomSheet.data = [{
        title: "选定", id: 1
    }, {
        title: "选定同类文件", id: 2
    }, {
        title: "粘贴", id: 3
    }, {
        title: "解压", id: 4
    }, {
        title: "重命名", id: 5
    }, {
        title: "整理", id: 6
    }]
    */
    fav.data = []
})


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
