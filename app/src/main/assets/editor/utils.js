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
async function createFile() {
    const path = decodeURIComponent(new URL(window.location).searchParams.get("path"));
    const s = (await readText()).trim();
    const dir = substringBeforeLast(path, "\\");
    const extension = substringAfterLast(path, ".");
    fetch(`/api/file?action=1&path=${encodeURIComponent(dir)}&dst=${encodeURIComponent(s.split(',').map(x => x.trim() + "." + extension).join(","))}`)
}
function cutBefore() {
    const before = textarea.value.substring(0, textarea.selectionStart);
    writeText(before);
    textarea.value = textarea.value.substring(textarea.selectionStart);
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
function formatCodeBlock() {
    //       let p = getContinueBlock(textarea);
    //       textarea.setRangeText(`\`\`\`rust
    // ${textarea.value.substring(p[0], p[1])}
    // \`\`\`
    // `,
    //         p[0], p[1], 'end')
    textarea.setRangeText(`
\`\`\`rust`,
        textarea.selectionStart, textarea.selectionEnd, 'end')
    writeText("```")
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
function formatIndentDecrease() {
    if (textarea.selectionStart === textarea.selectionEnd) {
        const line = getLine();
        if (line[0].startsWith("  "))
            textarea.setRangeText(
                line[0].slice(2),
                line[1], line[2], 'end'
            )
    } else {
        const string = getSelectedString(textarea);
        textarea.setRangeText(string.split('\n')
            // .filter(x => x.trim())
            .map(x => x.startsWith("  ") ? x.slice(2) : x).join('\n'), textarea.selectionStart, textarea.selectionEnd, 'end');
    }
}
function formatIndentIncrease() {
    if (textarea.selectionStart === textarea.selectionEnd) {
        const line = getLine();
        textarea.setRangeText(
            ' '.repeat(2) + line[0],
            line[1], line[2], 'end'
        )
    } else {
        const string = getSelectedString(textarea);
        textarea.setRangeText(string.split('\n')
            // .filter(x => x.trim())
            .map(x => '  ' + x).join('\n'), textarea.selectionStart, textarea.selectionEnd, 'end');
    }
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
function getPatterns() {
    let strings;
    if (typeof NativeAndroid !== 'undefined') {
        strings = NativeAndroid.getString("pattern")
    } else {
        strings = localStorage.getItem('pattern')
    }
    return strings;
}
function getSelectedString(textarea) {
    return textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
}
function insertBound() {
    textarea.setRangeText('```', textarea.selectionStart, textarea.selectionEnd, 'end');
}
async function insertLink() {
    const strings = await readText();
    let name = '';
    try {
        name = await (await fetch(`/title?path=${encodeURIComponent(strings)}`)).text()
    } catch (e) {
    }
    textarea.setRangeText(
        `[${name.trim()}](${strings})`,
        textarea.selectionStart,
        textarea.selectionEnd,
        'end'
    )
}
function isObject(obj) {
    return obj !== undefined && obj !== null && obj.constructor == Object;
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
function loadPatterns(patterns) {
    this.patterns = patterns.split('\n')
        .filter(x => x.trim())
        .map(x => x.trim().split('|'))
}
function onCopy() {
    const pv = findCodeBlock(textarea);
    writeText(textarea.value.substring(pv[0], pv[1]));
}
function onCopyLine() {
    copyLine(textarea);
}
function onCopyLine() {
    copyLine(textarea);
}
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
function onCutLine() {
    const p = getLine(textarea);
    writeText(p[0]);
    textarea.setRangeText(``,
        p[1], p[2], 'end')
}
function onDeleteLine() {
    const p = getLine(textarea);
    let start = p[1];
    let end = p[2];
    const re = new RegExp("[\\s\t]");
    while (start > -1 && re.test(textarea.value[start - 1]))
        start--
    while (end + 1 < textarea.value.length && re.test(textarea.value[end]))
        end++;
    textarea.setRangeText(`\n\n`,
        start, end, 'end');
}
function onDeleteString() {
    const start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    while (end + 1 < textarea.value.length && textarea.value[end] !== ']') {
        end++;
    }
    textarea.setRangeText('', start, end, 'end');
    console.log(start);
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
function onFormatBold() {
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    // \(\)\[\].!/\?%-
    const re = new RegExp(codeRegex);
    while (start > -1 && re.test(textarea.value[start - 1])) {
        start--;
    }
    while (end + 1 < textarea.value.length && re.test(textarea.value[end])) {
        end++;
    }
    const value = textarea.value.substring(start, end);
    textarea.setRangeText(` **${value.trim()}** `, start, end, 'end');
    writeText('`')
}
function onFormatCode() {
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    // \(\)\[\].!/\?%-
    const re = new RegExp(codeRegex);
    while (start > -1 && re.test(textarea.value[start - 1])) {
        start--;
    }
    while (end + 1 < textarea.value.length && re.test(textarea.value[end])) {
        end++;
    }
    const value = textarea.value.substring(start, end);
    textarea.setRangeText(` \`${value.trim()}\` `, start, end, 'end');
    writeText('`')
}
function indentCodeBlock() {
    const indexs = findCodeBlock(textarea);
    if (textarea.selectionStart !== textarea.selectionEnd) {
        const selected = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        let s = textarea.value.substring(indexs[0], indexs[1])
            .split('\n').map(x => {
                if (x.startsWith(selected)) {
                    x = x.substring(selected.length);
                }
                return x;
            }).join('\n');
        textarea.setRangeText(s, indexs[0], indexs[1], 'end');
    } else {
        let s = textarea.value.substring(indexs[0], indexs[1])
            .split('\n').map(x => {
                x = `    ` + x;
                return x;
            }).join('\n');
        textarea.setRangeText(s, indexs[0], indexs[1], 'end');
    }
}
function onFormatHead() {
    formatHead(textarea, 3)
}
function onFormatList() {
    let p = getIndexLine(textarea);
    let p1 = p;
    while (true) {
        if (p1[1] <= 0) {
            break;
        }
        let p2 = getIndexLine(textarea, p1[1] - 1);
        if (p2[0].trim()) {
            if (/(\d+). /.test(p2[0])) {
                textarea.setRangeText(`    - ${p[0]}`,
                    p[1], p[2], 'end')
                return;
            } else if (/ +- /.test(p2[0])) {
                textarea.setRangeText(`${/( +)- /.exec(p2[0])[1]}- ${p[0]}`,
                    p[1], p[2], 'end')
                return;
            } else {
                textarea.setRangeText(`- ${p[0]}`,
                    p[1], p[2], 'end')
                return;
            }
        }
        p1 = p2;
    }
    textarea.setRangeText(`- ${p[0]}`,
        p[1], p[2], 'end')
}
function onFormatNumberList() {
    let p = getIndexLine(textarea);
    let p1 = p;
    while (true) {
        if (p1[1] <= 0) {
            break;
        }
        let p2 = getIndexLine(textarea, p1[1] - 1);
        if (p2[0].trim()) {
            let index = 1;
            if (/(\d+). /.test(p2[0])) {
                index = parseInt(/(\d+). /.exec(p2[0])[1]) + 1;
                textarea.setRangeText(`${index}. ${p[0]}`,
                    p[1], p[2], 'end')
                return;
            } else {
                textarea.setRangeText(`${index}. ${p[0]}`,
                    p[1], p[2], 'end')
                return;
            }
        }
        p1 = p2;
    }
    textarea.setRangeText(`1. ${p[0]}`,
        p[1], p[2], 'end')
}
function onInsertComment() {
    let start = textarea.selectionStart;
    const strings = textarea.value;
    if (strings[start] === '\n' && start - 1 > 0) {
        start--;
    }
    while (start > 0 && strings[start - 1] !== '\n') {
        start--;
    }
    let end = textarea.selectionEnd;
    while (end + 1 < strings.length && strings[end] !== '\n') {
        end++;
    }
    if (end < textarea.value.length) {
        let nexEnd = end + 1;
        while (nexEnd + 1 < strings.length && /\s+/.test(strings[nexEnd])) {
            nexEnd++;
        }
        textarea.setRangeText(`${' '.repeat(nexEnd - end - 1)}// `, start, start, 'end')
        return
    }
    textarea.setRangeText(`// `, this.textarea.selectionStart, this.textarea.selectionEnd, 'end')
}
function onShow() {
    actions.style.display = 'block'
}
function onShowDialog() {
    const customDialog = document.createElement('custom-dialog');
    document.body.appendChild(customDialog);
    customDialog.title = ""
    window.customDialog = customDialog;
    customDialog.addEventListener('submit', evt => {
        this.setPatterns(customDialog.content);
        this.loadPatterns(customDialog.content)
    });
    const patterns = this.getPatterns();
    if (patterns) {
        customDialog.content = patterns;
    }
    //customDialog.style.display = 'none';
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
async function onTranslateChinese() {
    let array1 = getLine();
    let strings = (typeof NativeAndroid !== 'undefined') ? NativeAndroid.translate(array1[0]) : (await translate(array1[0], 'zh'));
    if (patterns) {
        for (let index = 0; index <patterns.length; index++) {
            const element = patterns[index];
            strings = strings.replaceAll(new RegExp(
                element[0], 'g'
            ), element[1])
        }
    }
    textarea.setRangeText(`\n\n${(strings)}`, array1[1], array1[2], 'end');
}
async function onTranslateEnglish() {
    let array1 = getLine();
    textarea.setRangeText(`\n\n${await translate(array1[0], 'en')}
        `, array1[2], array1[2], 'end');
}
async function onTranslateFn() {
    let array1 = getLine();
    textarea.setRangeText(`\n\nfn ${snake(await translate(array1[0], 'en'))}(){
    }
          `, array1[2], array1[2], 'end');
}
function openLink() {
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    while (start > -1 && textarea.value[start] !== ' ' && textarea.value[start] !== '(' && textarea.value[start] !== '\n') {
        start--;
    }
    while (end < textarea.value.length && textarea.value[end] !== ' ' && textarea.value[end] !== ')' && textarea.value[end] !== '\n') {
        end++;
    }
    if (textarea.selectionStart === textarea.selectionEnd) {
        window.open(textarea.value.substring(start + 1, end));
    } else {
        textarea.setRangeText(` [](${textarea.value.substring(start, end).trim()})`, start, end, 'end');
    }
}
async function pasteCode() {
    let strings;
    if (typeof NativeAndroid !== 'undefined') {
        strings = NativeAndroid.readText()
    } else {
        strings = await navigator.clipboard.readText()
    }
    textarea.setRangeText(`
\`\`\`rust
${strings}
\`\`\`
`, textarea.selectionStart, textarea.selectionEnd, 'end');
    writeText("```")
}
async function pasteEnd() {
    textarea.value = textarea.value.trim() +
        (await readText())
}
function preview() {
    const searchParams = new URL(window.location).searchParams;
    if (searchParams.has("path")) {
        const path = searchParams.get("path");
        window.open(`/markdown?path=${path}`, '_blank')
    } else {
        window.open(`/markdown?id=${searchParams.get("id")}`, '_blank')
    }
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
async function render() {
    const obj = await loadData();
    if (isObject(obj)) {
        try {
            const obj = await loadData()
            document.title = obj.title;
            textarea.value = `# ${obj.title}|${JSON.stringify(obj.tags)}
${obj.content.trim()}`
        } catch (error) {
            console.log(error)
        }
    } else {
        textarea.value = obj;
    }
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
function setPatterns(patterns) {
    if (typeof NativeAndroid !== 'undefined') {
        NativeAndroid.setString("pattern", patterns)
    } else {
        localStorage.setItem('pattern', patterns)
    }
}
function sortLines() {
    const points = findBlock(textarea);
    const lines = textarea.value.substring(points[0], points[1]).split('\n')
        .sort((x, y) => {
            let v1 = /\d{4}\)/.exec(x);
            let v2 = /\d{4}\)/.exec(y)
            if (v1 && v2)
                return v1[0].localeCompare(v2[0])
            return x.localeCompare(y);
        });
    textarea.setRangeText(`\n\n${lines.join('\n')}`, points[0], points[1], 'end');
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
function uploadHanlder(editor) {
    tryUploadImageFromClipboard((ok) => {
        const string = `![](https://static.lucidu.cn/images/${ok})\n\n`;
        editor.setRangeText(string, editor.selectionStart, editor.selectionStart);
    }, () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', async ev => {
            const file = input.files[0];
            const imageFile = await uploadImage(file, file.name);
            const string = `![](https://static.lucidu.cn/images/${imageFile})\n\n`;
            editor.setRangeText(string, editor.selectionStart, editor.selectionStart);
        });
        input.click();
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