package psycho.euphoria.killer.utils;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;


import static psycho.euphoria.killer.utils.CreateNotification.KP_NOTIFICATION_CHANNEL_ID;


public class CreateNotificationChannel {
    public static void createNotificationChannel(Context context) {
        NotificationChannel notificationChannel =
                new NotificationChannel(
                        KP_NOTIFICATION_CHANNEL_ID,
                        "本地服务器",
                        NotificationManager.IMPORTANCE_LOW);
        ((NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE))
                .createNotificationChannel(notificationChannel);
    }
}