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
                        "删除"

        ]
    } else {
        sheet.data = [
            "选定",
            "选定同类文件",
            "重命名",
            "压缩",
            "收藏",
                        "删除"

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
        }
    })
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