function copyLine(editor, count) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const string = editor.value;
    let offsetStart = start;
    while (offsetStart > 0) {
        if (string[offsetStart - 1] !== '\n' && string[offsetStart - 1] !== '|')
            offsetStart--;
        else {
            // while (offsetStart > 0) {
            //     if (/\s/.test(string[offsetStart - 1]))
            //         offsetStart--;
            //     else break;
            // }
            break;
        }
    }
    let offsetEnd = end;
    while (offsetEnd < string.length) {
        if (string[offsetEnd + 1] !== '\n' && string[offsetEnd + 1] !== '|')
            offsetEnd++;
        else {
            /* while (offsetEnd < string.length) {
                 if (/\s/.test(string[offsetEnd + 1]))
                     offsetEnd++;
                 else break;
             }*/
            offsetEnd++;
            break;
        }
    }
    const str = string.substring(offsetStart, offsetEnd).trim();
    writeText(str);
    editor.focus()
}
function findBlock(textarea) {
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    const strings = textarea.value;
    if (strings[start] === '\n' && start - 1 > 0) {
        start--;
    }
    let founded = false;
    while (start > 0) {
        if (strings[start] == '\n') {
            let j = start - 1;
            while (j > 0 && /\s/.test(strings[j])) {
                if (strings[j] === '\n') {
                    founded = true;
                    break;
                }
                j--;
            }
        }
        if (founded) {
            break
        }
        start--;
    }
    founded = false;
    while (end + 1 < strings.length) {
        if (strings[end] == '\n') {
            let j = end + 1;
            while (j + 1 < strings.length && /\s/.test(strings[j])) {
                if (strings[j] === '\n') {
                    founded = true;
                    break;
                }
                j++;
            }
        }
        if (founded) {
            break
        }
        end++;
    }
    return [start, end]
}
function findCodeBlock(textarea) {
    const value = textarea.value;
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    while (start > -1) {
        if (value[start] === '`' && value[start - 1] === '`' && value[start - 2] === '`') {
            start += 1;
            while (start < value.length) {
                if (value[start] === '\n') {
                    start++;
                    break;
                }
                start++;
            }
            break;
        }
        start--;
    }
    while (end < value.length) {
        if (value[end] === '`' && value[end + 1] === '`' && value[end + 2] === '`') {
            end--;
            break;
        }
        end++;
    }
    return [start, end];
}
function findCodeBlockExtend(textarea) {
    const value = textarea.value;
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    while (start > -1) {
        if (value[start] === '`' && value[start - 1] === '`' && value[start - 2] === '`') {
            // start += 1;
            start -= 2;
            while (start - 1 > 0 && value[start - 1] !== '\n') {
                start--;
            }
            break;
        }
        start--;
    }
    while (end < value.length) {
        if (value[end] === '`' && value[end + 1] === '`' && value[end + 2] === '`') {
            end += 2;
            break;
        }
        end++;
    }
    return [start, end];
}
function findExtendPosition(editor) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    let string = editor.value;
    let offsetStart = start;
    while (offsetStart > 0) {
        if (!/\s/.test(string[offsetStart - 1])) offsetStart--; else {
            let os = offsetStart;
            while (os > 0 && /\s/.test(string[os - 1])) {
                os--;
            }
            if ([...string.substring(offsetStart, os).matchAll(/\n/g)].length > 1) {
                break;
            }
            offsetStart = os;
        }
    }
    let offsetEnd = end;
    while (offsetEnd < string.length) {
        if (!/\s/.test(string[offsetEnd + 1])) {
            offsetEnd++;
        } else {
            let oe = offsetEnd;
            while (oe < string.length && /\s/.test(string[oe + 1])) {
                oe++;
            }
            if ([...string.substring(offsetEnd, oe + 1).matchAll(/\n/g)].length > 1) {
                offsetEnd++;
                break;
            }
            offsetEnd = oe + 1;
        }
    }
    while (offsetStart > 0 && string[offsetStart - 1] !== '\n') {
        offsetStart--;
    }
    // if (/\s/.test(string[offsetEnd])) {
    //     offsetEnd--;
    // }
    return [offsetStart, offsetEnd];
}
function formatHead(editor, count) {
    // console.log("formatHead, ");
    // let start = editor.selectionStart;
    // const string = editor.value;
    // while (start - 1 > -1 && string.charAt(start - 1) !== '\n') {
    //     start--;
    // }
    // editor.setRangeText('#'.repeat(count || 2) + " ", start, start);
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const string = editor.value;
    let offsetStart = start;
    while (offsetStart > 0) {
        if (string[offsetStart - 1] !== '\n')
            offsetStart--;
        else {
            while (offsetStart > 0) {
                if (/\s/.test(string[offsetStart - 1]))
                    offsetStart--;
                else break;
            }
            break;
        }
    }
    let offsetEnd = end;
    while (offsetEnd < string.length) {
        if (string[offsetEnd + 1] !== '\n')
            offsetEnd++;
        else {
            while (offsetEnd < string.length) {
                if (/\s/.test(string[offsetEnd + 1]))
                    offsetEnd++;
                else break;
            }
            break;
        }
    }
    editor.setRangeText(`\n\n${'#'.repeat(count)} ${string.substring(offsetStart, offsetEnd).trim()}\n`, offsetStart,
        offsetEnd, 'end');
}
function getContinueBlock(textarea) {
    let start = textarea.selectionStart;
    const strings = textarea.value;
    if (strings[start] === '\n' && start - 1 > 0) {
        start--;
    }
    while (start > 0) {
        if (strings[start - 1] === '\n') {
            let j = start - 1;
            while (j > 0 && strings[j - 1] !== '\n')
                j--;
            if (!strings.substring(start, j).trim()) {
                break
            }
        }
        start--;
    }
    let end = textarea.selectionEnd;
    while (end + 1 < strings.length) {
        if (strings[end] === '\n') {
            let j = end;
            while (j + 1 < strings.length && strings[++j] !== '\n');
            if (!strings.substring(end, j).trim()) {
                break
            }
        }
        end++;
    }
    return [start, end];
}
function getIndexLine(textarea, index) {
    let start = index || textarea.selectionStart;
    const strings = textarea.value;
    if (strings[start] === '\n' && start - 1 > 0) {
        start--;
    }
    while (start > 0 && strings[start - 1] !== '\n') {
        start--;
    }
    let end = index || textarea.selectionEnd;
    while (end + 1 < strings.length && strings[end] !== '\n') {
        end++;
    }
    return [strings.substring(start, end), start, end]
}
function getLine(extended) {
    let start = textarea.selectionStart;
    const strings = textarea.value;
    if (strings[start] === '\n' && start - 1 > 0) {
        start--;
    }
    while (start > 0 && strings[start - 1] !== '\n') {
        start--;
    }
    if (extended) {
        while (start + 1 < strings.length && /\s/.test(strings[start])) {
            start++
        }
    }
    let end = textarea.selectionEnd;
    while (end + 1 < strings.length && strings[end] !== '\n') {
        end++;
    }
    return [strings.substring(start, end), start, end]
}
function getSelectedString(textarea) {
    return textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
}
function jumpPage(textarea) {
    const line = getLine(textarea);
    const value = /(?<=(href|src)=")[^"]+(?=")/.exec(line);
    const path = new URL(window.location).searchParams.get("path");
    if (!value && path) {
        window.open('http://127.0.0.1:8081/' + substringBeforeLast(substringAfter(path, "\\app\\"), "."), "_blank");
        return
    }
    const src = `${window.location.origin}${window.location.pathname}?path=${encodeURIComponent(`${substringBeforeLast(path, "/")}/${value[0]}`)}`;
    window.open(src, '_blank');
}
async function loadData() {
    const searchParams = new URL(window.location).searchParams;
    if (searchParams.get("id")) {
        const res = await fetch(`/api/article?id=${searchParams.get("id")}`, { cache: "no-cache" });
        return res.json();
    } else if (searchParams.get("path")) {
        const res = await fetch(`/api/file?path=${searchParams.get("path")}`, { cache: "no-cache" });
        return res.text();
    }
}
function onCopy() {
    const pv = findCodeBlock(textarea);
    writeText(textarea.value.substring(pv[0], pv[1]));
}
function onCopyLine() {
    copyLine(textarea);
}
async function onEval() {
    const p = findBlock(textarea);
    const s = textarea.value.substring(p[0], p[1]);
    textarea.setRangeText(
        ` = ${eval(s)}`,
        p[1],
        p[1],
        'end'
    )
}
function onShow() {
    actions.style.display = 'block'
}
function onShowTranslator() {
    onInsert();
}
async function onSnippet() {
    const strings = await readText();
    const selected = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
    )
    const snippet = localStorage.getItem('snippet');
    textarea.setRangeText(
        snippet.replaceAll('$1', strings)
            .replaceAll('$2', selected),
        textarea.selectionEnd,
        textarea.selectionEnd,
        'end'
    )
}
async function onTranslateFn() {
    let array1 = getLine();
    textarea.setRangeText(`\n\nfn ${snake(await translate(array1[0], 'en'))}(){
    }
          `, array1[2], array1[2], 'end');
}
async function removeLines() {
    if (textarea.selectionStart === textarea.selectionEnd) {
        const p = findExtendPosition(textarea);
        let start = p[0];
        while (start > -1 && /\s/.test(textarea.value[start - 1])) {
            start--;
        }
        let end = p[1];
        while (end + 1 < textarea.value.length && /\s/.test(textarea.value[end + 1])) end++;
        if (typeof NativeAndroid !== 'undefined') {
            NativeAndroid.writeText(textarea.value.substring(start, end));
        } else {
            await navigator.clipboard.writeText(textarea.value.substring(start, end))
        }
        textarea.setRangeText('\n', start, end);
        textarea.selectionEnd = start;
    } else {
        textarea.value = textarea.value.substring(textarea.selectionEnd);
        textarea.selectionStart = 0;
        textarea.selectionEnd = 0;
        textarea.scrollLeft = 0;
        textarea.scrollTop = 0;
    }
}
async function saveData() {
    const searchParams = new URL(window.location).searchParams;
    if (searchParams.get("path")) {
        await fetch(`/api/file?path=${searchParams.get("path")}`, {
            method: 'POST',
            body: textarea.value
        })
        toast.setAttribute('message', '成功');
    } else {
        submitServer()
    }
}
async function submitServer() {
    const firstLine = textarea.value.trim().split("\n", 2)[0];
    const obj = {
        content: substringAfter(textarea.value.trim(), "\n"),
        title: firstLine.replace(/^#+ +/, ''),
    };
    const searchParams = new URL(window.location.href).searchParams;
    const id = searchParams.get('id');
    let baseUri = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : '';
    if (id) {
        obj.id = parseInt(id);
        obj.update_at = new Date().getTime();
    } else {
        obj.create_at = new Date().getTime();
        obj.update_at = new Date().getTime();
    }
    if (obj.title.indexOf('|') !== -1) {
        const tags = JSON.parse(substringAfter(obj.title, '|').trim() || '[]');
        if (tags.length) {
            obj.tags = tags;
        }
        obj.title = substringBefore(obj.title, '|').trim();
    }
    const m = /!\[]\(([^)]*?)\)/.exec(textarea.value);
    if (m) {
        const thumbnail = m[1];
        if (thumbnail) {
            obj.thumbnail = thumbnail;
        }
    }
    const response = await fetch(`${baseUri}/api/article`, {
        method: 'POST',
        body: JSON.stringify(obj)
    });
    const res = await response.text();
    if (id)
        toast.setAttribute('message', '成功');
    else
        window.location = `${window.location.origin}${window.location.pathname}?id=${res}`
}
function tab(textarea) {
    textarea.addEventListener('keydown', function (e) {
        if (e.keyCode === 9) {
            const p = findExtendPosition(textarea);
            const start = this.selectionStart;
            textarea.setRangeText(
                textarea.value.substring(p[0], p[1])
                    .split('\n')
                    .map(i => {
                        return '\t' + i;
                    })
                    .join('\n'), p[0], p[1]);
            this.selectionStart = this.selectionEnd = start + 1;
            // prevent the focus lose
            e.preventDefault();
        }
    }, false);
}
function toBlocks(string) {
    let count = 0;
    let buf = [];
    const blocks = [];
    for (let i = 0; i < string.length; i++) {
        buf.push(string[i])
        if (string[i] === '{') {
            count++;
        } else if (string[i] === '}') {
            count--;
            if (count === 0) {
                blocks.push(buf.join(''))
                buf = [];
            }
        }
    }
    return blocks;
}
async function translate(value, to) {
    try {
        const response = await fetch(`${window.location.protocol}//kpkpkp.cn/api/trans?q=${encodeURIComponent(value.trim())}&to=${to}`);
        const obj = await response.json();
        return obj.sentences.map((element, index) => {
            return element.trans;
        }).join(' ');
    } catch (error) {
        console.log(error);
    }
}
function tryUploadImageFromClipboard(success, error) {
    navigator.permissions.query({
        name: "clipboard-read"
    }).then(result => {
        if (result.state === "granted" || result.state === "prompt") {
            navigator.clipboard.read().then(data => {
                console.log(data[0].types);
                const blob = data[0].getType("image/png");
                console.log(blob.then(res => {
                    const formData = new FormData();
                    formData.append("images", res, "1.png");
                    fetch(`https://lucidu.cn/v1/picture`, {
                        method: "POST", body: formData
                    }).then(res => {
                        return res.text();
                    }).then(obj => {
                        success(obj);
                    })
                }).catch(err => {
                    console.log(err)
                    error(err);
                }))
            })
                .catch(err => {
                    error(err);
                });
        } else {
            error(new Error());
        }
    });
}
async function uploadImage(image, name) {
    const form = new FormData();
    form.append('images', image, name)
    const response = await fetch(`https://lucidu.cn/v1/picture`, {
        method: 'POST', body: form
    });
    return await response.text();
}