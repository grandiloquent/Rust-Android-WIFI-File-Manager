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

