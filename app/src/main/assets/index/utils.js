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
