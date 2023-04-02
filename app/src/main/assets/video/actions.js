bind();

    layout.style.height = `${window.innerWidth * 0.5625}px`;
    let timer, items;

    video.preload = "auto"
    let path = getPath();
    video.src = `/api/file?path=${encodeURIComponent(path)}&isDir=0`;
    document.title = substringAfterLast(path, '\\')
    appendSubtitle(video);


    const width = progressBarBackground.getBoundingClientRect().width;
    const left = parseInt(window.getComputedStyle(bottom, null).getPropertyValue('padding-left'));

