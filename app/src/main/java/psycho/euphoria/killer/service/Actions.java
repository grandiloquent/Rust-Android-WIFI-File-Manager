package psycho.euphoria.killer.service;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;

import psycho.euphoria.killer.ServerService;

import static psycho.euphoria.killer.service.Data.KP_NOTIFICATION_CHANNEL_ID;

public class Actions {
    private static ServerService sServerService;

    public static void createNotification() {
        Notification notification =
                null;
        PendingIntent piDismiss = Calculations.getPendingIntentDismiss(sServerService);
        notification = new Notification.Builder(sServerService, KP_NOTIFICATION_CHANNEL_ID)
                .setContentTitle("本地服务器")
                .setSmallIcon(android.R.drawable.stat_sys_download)
                .addAction(Calculations.getAction(piDismiss))
                .build();
        sServerService.startForeground(1, notification);
    }

    public static void createNotificationChannel() {
        NotificationChannel notificationChannel =
                new NotificationChannel(
                        KP_NOTIFICATION_CHANNEL_ID,
                        "本地服务器",
                        NotificationManager.IMPORTANCE_LOW);
        ((NotificationManager) sServerService. getSystemService(Context.NOTIFICATION_SERVICE))
                .createNotificationChannel(notificationChannel);
    }

    public static void setServerService(ServerService serverService) {
        sServerService = serverService;
    }

}