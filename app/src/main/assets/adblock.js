(() => {
    [
        document.getElementById('overlay-container')
    ].forEach(x => {
        x && x.remove();
    })
})()