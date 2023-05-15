function getSearchParams(name) {
    return new URL(window.location).searchParams.get(name)
}
async function getString(uri) {
    const res = await fetch(uri);
    return res.text();
}
function joinPath(filename) {
    let path = getSearchParams('path') || `/storage/emulated/0`;
    return encodeURIComponent(`${path}/${filename}`)
}
function launchDeleteDialog() {
    const customPathsBottomSheet = document.createElement('custom-paths-bottom-sheet');
    document.body.appendChild(customPathsBottomSheet);
    const paths = getPaths();
    customPathsBottomSheet.data = paths;
    customPathsBottomSheet.addEventListener('submit', async evt => {
        const paths = getPaths();
        await requestDeleteFiles(paths);
    })
}
function launchMoveDialog() {
    const customPathsBottomSheet = document.createElement('custom-paths-bottom-sheet');
    document.body.appendChild(customPathsBottomSheet);
    const paths = getPaths();
    customPathsBottomSheet.data = paths;
    customPathsBottomSheet.addEventListener('submit', async evt => {
        await requestMoveFiles();
    })
}
function newDirectory() {
    const dialog = document.createElement('custom-dialog');
    dialog.title = "新建文件夹"
    const input = document.createElement('input');
    input.type = 'text';
    dialog.appendChild(input);
    document.body.appendChild(dialog);
    dialog.addEventListener('submit', async evt => {
        const filename = input.value.trim();
        if (!filename) return;
        await getString(`/api/file/new_dir?path=${joinPath(filename)}`)
    })
}
function newFile() {
    const dialog = document.createElement('custom-dialog');
    dialog.title = "新建文件"
    const input = document.createElement('input');
    input.type = 'text';
    dialog.appendChild(input);
    document.body.appendChild(dialog);
    dialog.addEventListener('submit', async evt => {
        const filename = input.value.trim();
        if (!filename) return;
        await getString(`/api/file/new_file?path=${joinPath(filename)}`)
    })
}


 async function requestDeleteFiles(paths) {
    const response = await fetch(`/api/file/delete`, {
        method: "POST",
        body: JSON.stringify(paths)
    });
    localStorage.setItem('paths', '');
    return response.json();
}
async function requestMoveFiles() {
    const paths = getPaths();
    const path = new URL(window.location).searchParams.get("path");
    const response = await fetch(`/api/file/move?dst=${path}`, {
        method: "POST",
        body: JSON.stringify(paths)
    });
    localStorage.setItem('paths', '');
    return response.json();
}
async function selectSameTypeFiles(detail) {
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
}

function showContextMenu(detail) {
    const sheet = document.createElement('custom-context-bottom-sheet');
    document.body.appendChild(sheet);
    if (detail.isDirectory !== "true" && (detail.path.endsWith(".zip")
        || detail.path.endsWith(".epub"))) {
        sheet.data = [
            "选定",
            "选定同类文件",
            "重命名",
            "解压",
            "删除",
            "复制"
        ]
    } else {
        sheet.data = [
            "选定",
            "选定同类文件",
            "重命名",
            "压缩",
            "收藏",
            "删除",
            "复制"
        ]
    }
    sheet.addEventListener('submit', evt => {
        if (evt.detail === '选定') {
            insertPathLocalStorage(detail.path)
            customToast.setAttribute('message', '成功写入剪切板');
        } else if (evt.detail === '选定同类文件') {
            selectSameTypeFiles(detail)
        } else if (evt.detail === '解压') {
            fetch(`/api/zip?path=${detail.path}`)
        } else if (evt.detail === '重命名') {
            rename(detail.path)
        } else if (evt.detail === "收藏") {
            saveStoragePath(detail.path);
        } else if (evt.detail === "删除") {
            showDeleteDialog(detail)
        } else if (evt.detail === "复制") {
            writeText(decodeURIComponent(detail.path))
        }
    })
}
function showDeleteDialog(detail) {
    const dialog = document.createElement('custom-dialog');
    document.body.appendChild(dialog);
    dialog.appendChild(document.createTextNode(
        `您确定要删除 ${decodeURIComponent(detail.path)} 吗`
    ));
    dialog.addEventListener('submit', async evt => {
        await requestDeleteFiles([
            decodeURIComponent(detail.path)
        ]);
        location.reload();
    })
}
async function writeText(value) {
    // const textarea = document.createElement("textarea");
    // textarea.style.position = 'fixed';
    // textarea.style.right = '100%';
    // document.body.appendChild(textarea);
    // textarea.value = message;
    // textarea.select();
    // document.execCommand('paste');
    // return textarea.value;
    if (typeof NativeAndroid !== 'undefined') {
        NativeAndroid.writeText(value)
    } else {
        await navigator.clipboard.writeText(value)
    }
}