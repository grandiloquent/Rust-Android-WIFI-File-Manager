document.querySelectorAll('[bind]').forEach(element => {
    if (element.getAttribute('bind')) {
        window[element.getAttribute('bind')] = element;
    }
    [...element.attributes].filter(attr => attr.nodeName.startsWith('@')).forEach(attr => {
        if (!attr.value) return;
        element.addEventListener(attr.nodeName.slice(1), evt => {
            window[attr.value](evt);
        });
    });
});

const id = new URL(window.location).searchParams.get("id");
let baseUri = window.location.host === '127.0.0.1:5500' ? 'http://192.168.8.55:10808' : '';
render();

async function render() {
    //     textarea.value = localStorage.getItem("content");

    //     if (id) {
    //         try {
    //             const obj = await loadData();
    //             document.title = obj.title;
    //             textarea.value = `# ${obj.title}|${obj.tag}

    // ${obj.content.trim()}
    //         `
    //         } catch (error) {
    //             console.log(error)
    //         }
    //     }
    const obj = await loadData();
    const md = new markdownit({
        linkify: true,
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(str, {language: lang}).value;
                } catch (__) {
                }
            }

            return ''; // use external default escaping
        }
    });

    wrapper.innerHTML = md.render(obj.content || obj);
}

function substringBetweenLast(string, start, end) {
    const startIndex = string.lastIndexOf(start);
    if (startIndex === -1) {
        return string;
    }
    const endIndex = string.indexOf(end, startIndex + start.length);

    return string.substring(startIndex + start.length, endIndex);

}

async function loadData() {
    const searchParams = new URL(window.location).searchParams;
    if (searchParams.has("path")) {
        const path = searchParams.get("path");
        document.title = substringBetweenLast(path, "\\", ".");
        const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`, {cache: "no-cache"});
        return res.text();
    } else {
        const id = searchParams.get("id");
        const res = await fetch(`/api/note?action=1&id=${id}`, {cache: "no-cache"});
        const obj = await res.json();
        document.title = obj.title;
        return obj;
    }
}

for (const iterator of Object.keys(window)) {
    console.log(iterator)
}