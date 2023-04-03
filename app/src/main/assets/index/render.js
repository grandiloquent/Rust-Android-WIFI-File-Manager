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