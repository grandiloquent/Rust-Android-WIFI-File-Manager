

async function requestMoveFiles() {
    const paths = getPaths();
    const path = new URL(window.location).searchParams.get("path");
    const response = await fetch(`/api/file/move?dst=${path}`, {
        method: "POST",
        body: JSON.stringify(paths)
    });
    localStorage.setItem('paths', '');
    return response.json();
}

function launchMoveDialog() {
    const customPathsBottomSheet = document.createElement('custom-paths-bottom-sheet');
    document.body.appendChild(customPathsBottomSheet);
    const paths = getPaths();
    customPathsBottomSheet.data = paths;
    customPathsBottomSheet.addEventListener('submit',async evt=>{
        await requestMoveFiles();
    })

}
