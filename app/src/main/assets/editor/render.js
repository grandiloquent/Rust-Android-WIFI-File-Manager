function isObject(obj) {
    return obj !== undefined && obj !== null && obj.constructor == Object;
}
async function render() {
    const obj = await loadData();
    if (isObject(obj)) {
        try {
            const obj = await loadData(id)
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

