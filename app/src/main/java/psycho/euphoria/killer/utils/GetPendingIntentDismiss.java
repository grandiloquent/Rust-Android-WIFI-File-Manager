package psycho.euphoria.killer.utils;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;

import psycho.euphoria.killer.ServerService;


public class GetPendingIntentDismiss {
    public static final String ACTION_DISMISS = "cn.kpkpkp.ServerService.ACTION_DISMISS";

    public static PendingIntent getPendingIntentDismiss(Context context) {
        Intent dismissIntent = new Intent(context, ServerService.class);
        dismissIntent.setAction(ACTION_DISMISS);
        return PendingIntent.getService(context, 0, dismissIntent, 0);
    }
}