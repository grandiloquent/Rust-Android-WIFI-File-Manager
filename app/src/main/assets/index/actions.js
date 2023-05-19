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
        queryElementByPath(path).remove();
    });
    document.body.appendChild(dialog);
}
async function downloadDirectory(path) {
    window.open(`${baseUri}/compress_dir?path=${encodeURIComponent(path)}`, '_blank');
}
function getExtension(path) {
    const index = path.lastIndexOf('.');
    if (index !== -1) {
        return path.substr(index + 1);
    }
    return null;
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
async function loadData(path, size) {
    const res = await fetch(`${baseUri}/api/files?path=${path || ''}&size=${size || 'false'}`);
    return res.json();
}
function newFile() {
    const dialog = document.createElement('custom-dialog');
    dialog.setAttribute('title', "新建文件")
    const input = document.createElement('input');
    input.type = 'text';
    dialog.appendChild(input);
    dialog.addEventListener('submit', async () => {
        let path = new URL(window.location).searchParams.get("path")
            || '/storage/emulated/0';
        const res = await fetch(`${baseUri}/api/file/new_file?path=${encodeURIComponent(path + "/" + input.value.trim())}`);
        window.location.reload();
    });
    document.body.appendChild(dialog);
}
function newDirectory() {
    const dialog = document.createElement('custom-dialog');
    dialog.setAttribute('title', "新建文件夹")
    const input = document.createElement('input');
    input.type = 'text';
    dialog.appendChild(input);
    dialog.addEventListener('submit', async () => {
        let path = new URL(window.location).searchParams.get("path")
            || '/storage/emulated/0';
        const res = await fetch(`${baseUri}/api/file/new_dir?path=${encodeURIComponent(path + "/" + input.value.trim())}`);
        window.location.reload();
    });
    document.body.appendChild(dialog);
}

function onDelete() {
    const dialog = document.createElement('custom-dialog');
    dialog.setAttribute('title', '删除文件');
    const div = document.createElement('div');
    div.className = "list-wrapper";
    const obj = JSON.parse(localStorage.getItem('paths') || "[]");
    const buf = [];
    for (let index = 0; index < obj.length; index++) {
        const element = obj[index];
        buf.push(`<div class="list-item" data-path="${element}"><div class="list-item-text">${element}</div>
        <div class="list-item-action">删除</div>
        </div>`);
    }
    div.innerHTML = buf.join('');
    dialog.appendChild(div);
    div.querySelectorAll('.list-item').forEach(listItem => {
        listItem.addEventListener('click', evt => {
            let index = obj.indexOf(listItem.dataset.path);
            if (index !== -1) {
                obj.splice(index, 1);
            }
            listItem.remove();
        });
    });
    dialog.addEventListener('submit', async () => {
        const res = await fetch(`${baseUri}/api/file/delete`, {
            method: 'POST',
            body: JSON.stringify(obj)
        });
        localStorage.setItem('paths', '');
        location.reload();
    });
    document.body.appendChild(dialog);
}
function queryElementByPath(path) {
    return document.querySelector(`[data-path="${path}"]`);
}
function renameFile(path) {
    const dialog = document.createElement('custom-dialog');
    dialog.setAttribute('title', "重命名")
    const input = document.createElement('input');
    input.type = 'text';
    input.value = substringAfterLast(path, "/");
    dialog.appendChild(input);
    dialog.addEventListener('submit', async () => {
        const res = await fetch(`${baseUri}/api/file/rename?path=${encodeURIComponent(path)}&dst=${encodeURIComponent(substringBeforeLast(path, "/") + "/" + input.value.trim())}`);
        window.location.reload();
    });
    document.body.appendChild(dialog);
}
async function render(path) {
    setDocumentTitle(path);
    const searchParams = new URL(window.location).searchParams;
    path = path || searchParams.get("path") || '/storage/emulated/0';
    const res = await loadData(path, searchParams.get("size"));
    this.wrapper.innerHTML = res.sort((x, y) => {
        if (x.is_directory !== y.is_directory) if (x.is_directory) return -1; else return 1;
        return x.path.localeCompare(y.path)
    })
        .map(x => {
            return `<div class="item" data-path="${x.path}" data-isdirectory=${x.is_directory}>
            <div class="item-icon ${x.is_directory ? 'item-directory' : 'item-file'}" 
            ${imageRe.test(x.path) ? `style="background-repeat:no-repeat;background-size:contain;background-position:50% 50%;background-image:url(${baseUri}/api/file?path=${x.path})"` : ''}
            ></div>
          <div class="item-title">
          <div>${substringAfterLast(x.path, "/")}</div>
          <div class="item-subtitle">${humanFileSize(x.size)}</div>
          </div>
          
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
function selectSameType(path, isDirectory) {
    const extension = getExtension(path);
    const buf = [];
    document.querySelectorAll('.item').forEach(item => {
        const isdirectory = item.dataset.isdirectory === 'true';
        if (isDirectory) {
            if (isdirectory) {
                buf.push(item.dataset.path);
            }
        } else {
            if (!isdirectory) {
                if (extension === getExtension(item.dataset.path)) {
                    buf.push(item.dataset.path);
                }
            }
        }
    });
    localStorage.setItem("paths", JSON.stringify(buf));
    toast.setAttribute('message', '已成功写入剪切板');
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
    addContextMenuItem(bottomSheet, '复制路径', () => {
        bottomSheet.remove();
        writeText(path);
    });
    addContextMenuItem(bottomSheet, '选择相同类型', () => {
        bottomSheet.remove();
        selectSameType(path, isDirectory);
    });
    addContextMenuItem(bottomSheet, '重命名', () => {
        bottomSheet.remove();
        renameFile(path);
    });
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
function onMove() {
    const dialog = document.createElement('custom-dialog');
    dialog.setAttribute('title', '移动文件');
    const div = document.createElement('div');
    div.className = "list-wrapper";
    const obj = JSON.parse(localStorage.getItem('paths') || "[]");
    const buf = [];
    for (let index = 0; index < obj.length; index++) {
        const element = obj[index];
        buf.push(`<div class="list-item" data-path="${element}"><div class="list-item-text">${element}</div>
        <div class="list-item-action">删除</div>
        </div>`);
    }
    div.innerHTML = buf.join('');
    dialog.appendChild(div);
    div.querySelectorAll('.list-item').forEach(listItem => {
        listItem.addEventListener('click', evt => {
            let index = obj.indexOf(listItem.dataset.path);
            if (index !== -1) {
                obj.splice(index, 1);
            }
            listItem.remove();
        });
    });
    let path = new URL(window.location).searchParams.get("path")
        || '/storage/emulated/0';
    dialog.addEventListener('submit', async () => {
        const res = await fetch(`${baseUri}/api/file/move?dst=${encodeURIComponent(path)}`, {
            method: 'POST',
            body: JSON.stringify(obj)
        });
        localStorage.setItem('paths', '');
        location.reload();
    });
    document.body.appendChild(dialog);
}