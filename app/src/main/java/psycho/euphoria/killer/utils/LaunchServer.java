package psycho.euphoria.killer.utils;

import android.content.Intent;

import psycho.euphoria.killer.MainActivity;
import psycho.euphoria.killer.ServerService;

public class LaunchServer {
    public static void launchServer(MainActivity context) {
        Intent intent = new Intent(context, ServerService.class);
        context.startService(intent);
    }
}