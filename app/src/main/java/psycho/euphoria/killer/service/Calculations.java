package psycho.euphoria.killer.service;

import android.app.Notification;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;

import java.io.IOException;
import java.net.ServerSocket;

import psycho.euphoria.killer.ServerService;

import static psycho.euphoria.killer.service.Data.ACTION_DISMISS;

public class Calculations {
    public static PendingIntent getPendingIntentDismiss(Context context) {
        Intent dismissIntent = new Intent(context, ServerService.class);
        dismissIntent.setAction(ACTION_DISMISS);
        return PendingIntent.getService(context, 0, dismissIntent, 0);
    }

    public static Notification.Action getAction(PendingIntent piDismiss) {
        return new Notification.Action.Builder(null, "关闭", piDismiss).build();
    }

    public static int getUsablePort(int start) {
        while (true) {
            try {
                ServerSocket serverPort = new ServerSocket(start);
                return start;
            } catch (IOException ignored) {
                start++;
            }
        }
    }
}