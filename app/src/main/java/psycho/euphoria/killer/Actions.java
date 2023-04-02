package psycho.euphoria.killer;

import android.webkit.WebView;

import java.util.List;

public class Actions {
    public static final int ITEM_ID_REFRESH = 1;
    private static final String FILE_ANDROID_ASSET_HOME_INDEX_HTML = "file:///android_asset/home/index.html";
    private static MainActivity sContext;

    public static WebView initializeWebView() {
        WebView webView = new WebView(sContext);
        Calculations.setWebView(webView);
        webView.addJavascriptInterface(new WebAppInterface(sContext), "NativeAndroid");
        webView.setWebViewClient(new CustomWebViewClient(sContext));
        webView.setWebChromeClient(new CustomWebChromeClient(sContext));
        sContext.setContentView(webView);
        return webView;
    }

    public static void loadStartPage(boolean isHomePage) {
        if(isHomePage){
            sContext.getWebView().loadUrl(FILE_ANDROID_ASSET_HOME_INDEX_HTML);
        }else {
            String lastedAddress = sContext.getSharedPreferences().getString("address", FILE_ANDROID_ASSET_HOME_INDEX_HTML);
            if (lastedAddress != null) {
                sContext.getWebView().loadUrl(lastedAddress);
            }
        }
    }

    public static boolean requestPermission() {
        List<String> needPermissions = Calculations.filterNeedPermissions(sContext);
        if (needPermissions.size() > 0) {
            sContext.requestPermissions(needPermissions.toArray(new String[0]), ITEM_ID_REFRESH);
            return true;
        }
        return false;
    }

    public static void setContext(MainActivity context) {
        sContext = context;
    }
}