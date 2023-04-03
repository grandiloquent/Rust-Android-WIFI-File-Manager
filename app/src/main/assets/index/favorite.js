function readStoragePaths() {
    const text = NativeAndroid.getString('favorite_paths');
    return JSON.parse(text || '[]');
}
function saveStoragePath(path) {
    let paths = readStoragePaths();
    paths.push(path);
    paths = [...new Set(paths)];
    NativeAndroid.setString('favorite_paths', JSON.stringify(paths));
}
function onShowFavorites() {
    fav.style.display = "block";
}
