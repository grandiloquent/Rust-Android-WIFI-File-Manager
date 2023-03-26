(() => {
    window.addEventListener('scroll', evt => {
        [
            document.getElementById('overlay-container')
        ].forEach(x => {
            x && x.remove();
        })
    })
})()