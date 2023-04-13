package psycho.euphoria.killer.utils;

import android.content.Context;

import psycho.euphoria.killer.MainActivity;

public class Refresh {
    public static void refresh(MainActivity context) {
        context.getWebView().clearCache(false);
        context.getWebView().reload();
    }
}