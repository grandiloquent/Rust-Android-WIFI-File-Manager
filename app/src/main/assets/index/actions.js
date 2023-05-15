
function addContextMenuItem(bottomSheet, title, handler) {
    const item = document.createElement('div');
    item.className = 'menu-item';
    item.textContent = title;
    bottomSheet.appendChild(item);
    item.addEventListener('click', handler);
}

function deleteFile(detail) {
    const dialog = document.createElement('custom-dialog');
    const div = document.createElement('div');
    div.textContent = `您确定要删除 ${substringAfterLast(decodeURIComponent(detail.path), "/")} 吗？`;
    dialog.appendChild(div);
    dialog.addEventListener('submit', async () => {
        const res = await fetch(`${baseUri}/api/file/delete`, {
            method: 'POST',
            body: JSON.stringify([decodeURIComponent(detail.path)])
        });
        document.querySelector(`[path="${detail.path}"]`).remove();
    });
    document.body.appendChild(dialog);

}

function initializeDropZone() {
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

}
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
            return `<custom-item bind @submit="onItemClick" ${x.is_directory ? 'folder' : ''} title="${substringAfterLast(x.path, '/')}" path="${encodeURIComponent(x.path)}" isdirectory="${x.is_directory}"></custom-item>`
        }).join('');
    bind(this.wrapper);
}
function setDocumentTitle(path) {
    if (!path) return;
    document.title = substringAfterLast(decodeURIComponent(path), "/")
}