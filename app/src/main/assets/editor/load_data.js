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