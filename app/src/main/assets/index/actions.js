function rename(path) {
    const source = substringAfterLast(decodeURIComponent(detail.path), "/");

    const dialog = document.createElement('custom-dialog');
    const div = document.createElement('div');
    dialog.setAttribute('title', "重命名");
    div.style = `display:flex;flex-direction:column;row-gap:10px;`
    dialog.appendChild(div);
    div.innerHTML = `<style>input[type="text"]
{
    background-color: transparent;
    border: 1px solid #dadce0;
    margin: 0;
    padding: 0 0 0 16px;
    font-size: 16px;
    font-family: Roboto,Helvetica Neue,Arial,sans-serif;
    color: rgba(0,0,0,.87);
    word-wrap: break-word;
    display: flex;
    flex: 1;
    -webkit-tap-highlight-color: transparent;
    width: 100%;
    line-height: 24px;
    padding-left: 3px;
    padding-right: 2px;
    overflow-y: hidden;
    outline: 0;
    box-sizing: border-box;
}</style>
    <input class="key" type="text" />`;
    const key = div.querySelector('.key');
    key.value = source;
    window.requestAnimationFrame(() => {
        if (source.indexOf('.') !== -1) {
            key.focus()
            key.setSelectionRange(0, source.lastIndexOf('.'))
        }
    })
    dialog.addEventListener('submit', async evt => {
        fetch(`/api/file/rename?path=${path || '/storage/emulated/0'}&dst=${key.value.trim()}`)
    })
    document.body.appendChild(dialog);
}