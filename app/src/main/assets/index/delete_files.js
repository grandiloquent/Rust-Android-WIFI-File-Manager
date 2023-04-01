async function requestDeleteFiles() {
    const paths = getPaths();
    const response = await fetch(`/api/files/delete`, {
        method: "POST",
        body: JSON.stringify(paths)
    });
    localStorage.setItem('paths', '');
    return response.json();
}

function launchDeleteDialog() {
    const customPathsBottomSheet = document.createElement('custom-paths-bottom-sheet');
    document.body.appendChild(customPathsBottomSheet);
    const paths = getPaths();
    customPathsBottomSheet.data = paths;
    customPathsBottomSheet.addEventListener('submit', async evt => {
        await requestDeleteFiles();
    })

}