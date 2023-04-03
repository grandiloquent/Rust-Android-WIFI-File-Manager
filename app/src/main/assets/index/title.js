function setDocumentTitle(path){
    if(!path) return;
    document.title = substringAfterLast(decodeURIComponent(path), "/")
}