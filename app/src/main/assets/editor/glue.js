


///////////////////
bind();



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
        switch (evt.key) {
            case '1': {
                evt.preventDefault();
                const pv = findCodeBlock(textarea);
                navigator.clipboard.writeText(textarea.value.substring(pv[0], pv[1]));
                break;
            }
            case '2': {
                evt.preventDefault();
                const p = findCodeBlock(textarea);
                textarea.setRangeText(await navigator.clipboard.readText(), p[0], p[1], "end");
                break;
            }
            case '3': {
                evt.preventDefault();
                const p = findCodeBlockExtend(textarea);
                textarea.setRangeText(textarea.value.substring(p[0], p[1])
                    .split('\n')
                    .map(x => `    ${x.trimEnd()}`).join('\n'), p[0], p[1]);
                break;
            }
            case 'd': {
                evt.preventDefault();
                actions.onInsertComment();
                break;
            }
            case 'e': {
                evt.preventDefault();
                onEval();
                break;
            }
            case 'f': {
                evt.preventDefault();
                insertBound();
                break;
            }
            case 'g': {
                evt.preventDefault();
                replaceText();
                break;
            }
            case 'h': {
                evt.preventDefault();
               actions.onFormatHead()
                break;
            }
            case 'j': {
                evt.preventDefault();
                actions.openLink();
                break;
            }
            case 'k': {
                evt.preventDefault();
                actions.insertLink();
                break;
            }
            case 'l': {
                evt.preventDefault();
                actions.pasteCode()
                break;
            }
            case 'o': {
                evt.preventDefault();
                sortLines();
                break;
            }
            case 'p': {
                evt.preventDefault();
                preview();
                break;
            }
            case 'r': {
                evt.preventDefault();
                actions.onFormatCodeBlock();
                break;
            }
            case 's': {
                evt.preventDefault();
                saveData();
                break;
            }
            case 'u': {
                evt.preventDefault();
                uploadHanlder(textarea)
                break;
            }
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
