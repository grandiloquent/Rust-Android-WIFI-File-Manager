///////////////////
bind();
customElements.whenDefined('custom-bottom-sheet').then(() => {
    customBottomSheet.data = [{
        id: 4,
        title: "翻译英文"
    }, {
        id: 3,
        title: "翻译中文"
    }, {
        id: 5,
        title: "粘贴代码"
    }, {
        id: 1,
        title: "复制代码块"
    }, {
        id: 7,
        title: "设置代码块"
    }, {
        id: 2,
        title: "预览"
    }, {
        id: 6,
        title: "执行代码"
    }, {
        id: 8,
        title: "插入链接"
    }, {
        id: 9,
        title: "代码"
    }, {
        id: 10,
        title: "翻译"
    }, {
        id: 11,
        title: "剪切代码段"
    }, {
        id: 12,
        title: "创建文件"
    }, {
        id: 13,
        title: "链接"
    }, {
        id: 14,
        title: "替换"
    }, {
        id: 15,
        title: "符号"
    },]
})

async function onCustomBottomSheet(evt) {
    customBottomSheet.style.display = 'none';
    switch (evt.detail.id) {
        case "1":
            onCopy();
            break;
        case "3":
            onTranslateChinese();
            break;
        case "4":
            onTranslateEnglish();
            break;
        case "5":
            evt.preventDefault();
            const p = findCodeBlock(textarea);
            textarea.setRangeText(await navigator.clipboard.readText(), p[0], p[1], "end");
            break;
        case "6":
            onEval();
            break;
        case "7":
            customDialog.style.display = 'block';
            break;
        case "9":
            onCode();
            break;
        case "10":
            onShowTranslator()
            break
        case "11":
            evt.preventDefault();
            const pv = findCodeBlockExtend(textarea);
            writeText(textarea.value.substring(pv[0] + 3, pv[1] - 3));
            textarea.setRangeText('', pv[0], pv[1] + 1, "end");
            break
        case "12":
            createFile();
            break
        case "14":
            replaceText()
            break;
        case "15":
            insertBound();
            break;
    }
}

async function createFile() {
    const path = decodeURIComponent(new URL(window.location).searchParams.get("path"));
    const s = (await readText()).trim();
    const dir = substringBeforeLast(path, "\\");
    const extension = substringAfterLast(path, ".");
    fetch(`/api/file?action=1&path=${encodeURIComponent(dir)}&dst=${encodeURIComponent(s .split(',').map(x=>x.trim()+"."+extension).join(","))}`)
}

function replaceText() {
    const founded = textarea.value.indexOf("```") !== -1;
    if (founded) {
        const pv = findCodeBlockExtend(textarea);
        let str = textarea.value.substring(pv[0] + 3, pv[1] - 3).trim();
        const firstLine = substringBefore(str, "\n");
        str = substringAfter(str, "\n");
        const secondLine = substringBefore(str, "\n");
        str = substringAfter(str, "\n").trim();

        textarea.setRangeText(str.replaceAll(new RegExp(firstLine, 'g'), secondLine), pv[0], pv[1] + 1, "end");
    } else {
        let str = textarea.value;
        const firstLine = substringBefore(str, "\n");
        str = substringAfter(str, "\n");
        const secondLine = substringBefore(str, "\n");
        str = substringAfter(str, "\n").trim();
        textarea.value = firstLine + "\n" + secondLine + "\n" + str.replaceAll(new RegExp(firstLine, 'g'), secondLine)
            .replaceAll(new RegExp(upperCamel(firstLine), 'g'), upperCamel(secondLine));

    }

}

document.addEventListener('visibilitychange', () => {
    localStorage.setItem('contents', textarea.value);
})
textarea.value = localStorage.getItem('contents') || '';
const id = new URL(window.location).searchParams.get("id");
let baseUri = window.location.host === '127.0.0.1:5500' ? 'http://192.168.8.55:10808' : '';
render();

function insertBound() {
    textarea.setRangeText('```', textarea.selectionStart, textarea.selectionEnd, 'end');
}

document.addEventListener('keydown', async evt => {
    console.log(evt.key)
    if (evt.ctrlKey) {
        if (evt.key === 's') {
            evt.preventDefault();
            await onSave();
        } else if (evt.key === 'j') {
            evt.preventDefault();
            openLink();
        } else if (evt.key === 'o') {
            evt.preventDefault();
            sortLines();
        } else if (evt.key === 'p') {
            evt.preventDefault();
            onPreview();
        } else if (evt.key === 'k') {
            evt.preventDefault();
            insertLink();
        } else if (evt.key === 'g') {
            evt.preventDefault();
            replaceText();
        } else if (evt.key === 'f') {
            evt.preventDefault();
            insertBound();
        } else if (evt.key === 'e') {
            evt.preventDefault();
            onEval();
        } else if (evt.key === 'l') {
            evt.preventDefault();
            onCode()
        } else if (evt.key === 'd') {
            evt.preventDefault();
            createFile();
        } else if (evt.key === '1') {
            evt.preventDefault();
            const pv = findCodeBlock(textarea);
            navigator.clipboard.writeText(textarea.value.substring(pv[0], pv[1]));
        } else if (evt.key === '2') {
            evt.preventDefault();
            const p = findCodeBlock(textarea);
            textarea.setRangeText(await navigator.clipboard.readText(), p[0], p[1], "end");
        } else if (evt.key === '3') {
            evt.preventDefault();
            const p = findCodeBlockExtend(textarea);
            textarea.setRangeText(textarea.value.substring(p[0], p[1])
                .split('\n')
                .map(x => `    ${x.trimEnd()}`).join('\n'), p[0], p[1]);
        } else if (evt.key === 'u') {
            evt.preventDefault();
            uploadHanlder(textarea)
        } else if (evt.key === 'h') {
            evt.preventDefault();
            formatHead(textarea, 3);
        }

    } else if (evt.key === 'Tab') {
        evt.preventDefault();

        if (textarea.selectionStart === textarea.selectionEnd) {
            const data = getLine(true);
            if (data[0].startsWith(";~"))
                textarea.setRangeText(data[0].slice(2), data[1], data[2], 'end');
            else
                textarea.setRangeText(';~', data[1], data[1], 'end');
        } else {
            const string = getSelectedString(textarea);
            console.log(string);
            textarea.setRangeText(string.split('\n')
                // .filter(x => x.trim())
                .map(x => '\t' + x.trim()).join('\n'), textarea.selectionStart, textarea.selectionEnd, 'end');
        }
    } else if (evt.key === 'F3') {
        evt.preventDefault();
        onTranslateChinese();
    }
});
