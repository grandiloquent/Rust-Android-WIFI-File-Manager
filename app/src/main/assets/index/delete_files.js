async function requestDeleteFiles(paths) {
    
    const response = await fetch(`/api/file/delete`, {
        method: "POST",
        body: JSON.stringify(paths)
    });
    localStorage.setItem('paths', '');
    return response.json();
}
function showDeleteDialog(detail) {
    const dialog = document.createElement('custom-dialog');
    document.body.appendChild(dialog);
    dialog.appendChild(document.createTextNode(
        `您确定要删除 ${decodeURIComponent(detail.path)} 吗`
    ));
    dialog.addEventListener('submit',async evt=>{
        await requestDeleteFiles( [
            decodeURIComponent(detail.path)
        ]);
        location.reload();
    })

}
function launchDeleteDialog() {
    const customPathsBottomSheet = document.createElement('custom-paths-bottom-sheet');
    document.body.appendChild(customPathsBottomSheet);
    const paths = getPaths();
    customPathsBottomSheet.data = paths;
    customPathsBottomSheet.addEventListener('submit', async evt => {
        const paths = getPaths();
        await requestDeleteFiles( paths);
    })

}