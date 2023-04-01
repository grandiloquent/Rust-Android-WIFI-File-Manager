
function startServer() {
    NativeAndroid.startServer();
}
function playVideo() {
    NativeAndroid.playVideo();
}
function openPage() {
    NativeAndroid.openPage();
}
function serverHome() {
    NativeAndroid.serverHome();
}
function videoList() {
    NativeAndroid.videoList();
}
function switchInputMethod() {
    NativeAndroid.switchInputMethod();
}
function searchVideo() {
    const string = NativeAndroid.readText();
    window.location.href=`https://www.google.com/search?q=${encodeURIComponent(string)}+movie+online`;
}
function notes() {
    NativeAndroid.notes();
}
// 

bind();
