package psycho.euphoria.killer;

import android.content.Intent;
import android.net.Uri;
import android.os.Build.VERSION;
import android.os.Build.VERSION_CODES;
import android.os.Environment;
import android.provider.Settings;
import android.webkit.WebView;

import java.io.File;
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
        if (isHomePage) {
            sContext.getWebView().loadUrl(FILE_ANDROID_ASSET_HOME_INDEX_HTML);
        } else {
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

    public static void requestStorageManagerPermission() {
        if (VERSION.SDK_INT >= VERSION_CODES.R) {
            if (!Environment.isExternalStorageManager()) {
                try {
                    Uri uri = Uri.parse("package:" + BuildConfig.APPLICATION_ID);
                    Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, uri);
                    sContext.startActivity(intent);
                } catch (Exception ex) {
                    Intent intent = new Intent();
                    intent.setAction(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION);
                    sContext.startActivity(intent);
                }
            }
        }
    }

    public static void saveRenderedWebPage() {
        File d = new File(Environment.getExternalStorageDirectory(), "web.mht");
        sContext.getWebView().saveWebArchive(
                d.getAbsolutePath()
        );
    }

    public static void setContext(MainActivity context) {
        sContext = context;
    }
}