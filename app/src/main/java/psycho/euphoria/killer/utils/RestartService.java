package psycho.euphoria.killer.utils;

import android.content.Context;
import android.content.Intent;

import psycho.euphoria.killer.MainActivity;
import psycho.euphoria.killer.tasks.DownloaderService;

public class RestartService {
    public static void restartService(MainActivity context) {
        Intent service = new Intent(context, DownloaderService.class);
        service.setAction("stop");
        context.startService(service);
    }

}