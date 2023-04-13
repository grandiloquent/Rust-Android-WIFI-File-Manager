package psycho.euphoria.killer.utils;

import android.content.Context;

import java.io.File;

import psycho.euphoria.killer.MainActivity;

public class ClearWebViewCache {
    public static void clearWebViewCache(MainActivity context) {
        // ClearWebViewCache.clearWebViewCache(MainActivity.this);
        try {
            // 通过删除 WebView 缓存目录来清空访问网页后留下的缓存
            String dataDir = context.getPackageManager().getPackageInfo(context.getPackageName(), 0).applicationInfo.dataDir;
            new File(dataDir + "/app_webview/").delete();
        } catch (Exception e) {
            e.printStackTrace();
            e.getSuppressed();
        }
    }
}