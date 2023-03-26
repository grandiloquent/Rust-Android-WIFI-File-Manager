package psycho.euphoria.killer.tasks;


import psycho.euphoria.killer.tasks.DownloaderService.DownloaderRequest;

public interface RequestListener{
    void onProgress(DownloaderRequest downloaderRequest);
}
