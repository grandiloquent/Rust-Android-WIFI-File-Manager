package psycho.euphoria.killer.utils;

import psycho.euphoria.killer.MainActivity;

public class LoadStartPage {
    private static final String FILE_ANDROID_ASSET_HOME_INDEX_HTML = "file:///android_asset/home/index.html";

    public static void loadStartPage(MainActivity context, boolean isHomePage) {
        if (isHomePage) {
            context.getWebView().loadUrl(FILE_ANDROID_ASSET_HOME_INDEX_HTML);
        } else {
            String lastedAddress = context.getSharedPreferences().getString("address", FILE_ANDROID_ASSET_HOME_INDEX_HTML);
            if (lastedAddress != null) {
                context.getWebView().loadUrl(lastedAddress);
            }
        }
    }
}