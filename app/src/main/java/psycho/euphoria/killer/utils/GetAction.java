package psycho.euphoria.killer.utils;

import android.app.Notification;
import android.app.PendingIntent;
import android.content.Context;
import psycho.euphoria.killer.MainActivity;

public class GetAction {
    public static Notification.Action getAction(PendingIntent piDismiss) {
        return new Notification.Action.Builder(null, "关闭", piDismiss).build();
    }
}