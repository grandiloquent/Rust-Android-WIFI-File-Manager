


////////////////////////////////////////////////////////////





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

async function loadFile(path) {
    document.title = substringAfterLast(decodeURIComponent(path), "\\")
    const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`, { cache: "no-cache" });
    return res.text();
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



