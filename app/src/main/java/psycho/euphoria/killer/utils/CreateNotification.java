package psycho.euphoria.killer.utils;

import android.app.Notification;
import android.app.PendingIntent;
import android.content.Context;

import psycho.euphoria.killer.MainActivity;
import psycho.euphoria.killer.ServerService;

import static psycho.euphoria.killer.utils.GetAction.getAction;
import static psycho.euphoria.killer.utils.GetPendingIntentDismiss.getPendingIntentDismiss;

public class CreateNotification {
    public static final String KP_NOTIFICATION_CHANNEL_ID = "kp_notification_channel";

    public static void createNotification(ServerService context) {
        Notification notification =
                null;
        PendingIntent piDismiss = getPendingIntentDismiss(context);
        notification = new Notification.Builder(context, KP_NOTIFICATION_CHANNEL_ID)
                .setContentTitle("本地服务器")
                .setSmallIcon(android.R.drawable.stat_sys_download)
                .addAction(getAction(piDismiss))
                .build();
       context.startForeground(1, notification);
    }
}