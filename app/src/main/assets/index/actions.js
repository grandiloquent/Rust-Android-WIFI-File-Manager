
function addContextMenuItem(bottomSheet, title, handler) {
    const item = document.createElement('div');
    item.className = 'menu-item';
    item.textContent = title;
    bottomSheet.appendChild(item);
    item.addEventListener('click', handler);
}

function deleteFile(path) {
    const dialog = document.createElement('custom-dialog');
    const div = document.createElement('div');
    div.textContent = `您确定要删除 ${substringAfterLast(path, "/")} 吗？`;
    dialog.appendChild(div);
    dialog.addEventListener('submit', async () => {
        const res = await fetch(`${baseUri}/api/file/delete`, {
            method: 'POST',
            body: JSON.stringify([path])
        });
        document.querySelector(`[data-path="${path}"]`).remove();
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
            return `<div class="item" data-path="${x.path}" data-isdirectory=${x.is_directory}>
            <div class="item-icon ${x.is_directory ? 'item-directory' : 'item-file'}" 
            ${imageRe.test(x.path) ? `style="background-repeat:no-repeat;background-size:contain;background-position:50% 50%;background-image:url(${baseUri}/api/file?path=${x.path})"` : ''}
            ></div>
          <div class="item-title">${substringAfterLast(x.path, "/")}</div>
          <div class="item-more">
            <svg viewBox="0 0 24 24">
              <path d="M12 15.984q0.797 0 1.406 0.609t0.609 1.406-0.609 1.406-1.406 0.609-1.406-0.609-0.609-1.406 0.609-1.406 1.406-0.609zM12 9.984q0.797 0 1.406 0.609t0.609 1.406-0.609 1.406-1.406 0.609-1.406-0.609-0.609-1.406 0.609-1.406 1.406-0.609zM12 8.016q-0.797 0-1.406-0.609t-0.609-1.406 0.609-1.406 1.406-0.609 1.406 0.609 0.609 1.406-0.609 1.406-1.406 0.609z"></path>
            </svg>
          </div>
          </div>`
        }).join('');
    document.querySelectorAll('.item').forEach(item => {
        item.addEventListener('click', onItemClick);
    })
    document.querySelectorAll('.item-more').forEach(item => {
        item.addEventListener('click', showContextMenu);
    })

}
function setDocumentTitle(path) {
    if (!path) return;
    document.title = substringAfterLast(decodeURIComponent(path), "/")
}
function showContextMenu(evt) {
    evt.stopPropagation();
    const dataset = evt.currentTarget.parentNode.dataset;
    const path = dataset.path;
    const isDirectory = dataset.isdirectory === 'true';

    const bottomSheet = document.createElement('custom-bottom-sheet');
    addContextMenuItem(bottomSheet, '删除', () => {
        bottomSheet.remove();
        deleteFile(path);
    });
    if (isDirectory) {
        addContextMenuItem(bottomSheet, '下载', () => {
            bottomSheet.remove();
            downloadDirectory(path);
        });
    }
    document.body.appendChild(bottomSheet);
}
async function downloadDirectory(path) {
    window.open(`${baseUri}/compress_dir?path=${encodeURIComponent(path)}`, '_blank');
}