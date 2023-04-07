function getSearchParams(name) {
    return new URL(window.location).searchParams.get(name)
}

async function getString(uri) {
    const res = await fetch(uri);
    return res.text();
}

function joinPath(filename) {
    let path = getSearchParams('path') || `/storage/emulated/0`;
    return encodeURIComponent(`${path}/${filename}`)
}
async function writeText(value) {
    // const textarea = document.createElement("textarea");
    // textarea.style.position = 'fixed';
    // textarea.style.right = '100%';
    // document.body.appendChild(textarea);
    // textarea.value = message;
    // textarea.select();
    // document.execCommand('paste');
    // return textarea.value;

    if (typeof NativeAndroid !== 'undefined') {
        NativeAndroid.writeText(value)
    } else {
        await navigator.clipboard.writeText(value)
    }
}

