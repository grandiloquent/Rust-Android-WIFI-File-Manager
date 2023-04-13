
package psycho.euphoria.killer;

import android.Manifest.permission;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.net.Uri;
import android.os.Build.VERSION;
import android.os.Build.VERSION_CODES;
import android.os.Environment;
import android.os.StrictMode;
import android.provider.Settings;
import android.webkit.WebSettings;
import android.webkit.WebView;

import java.io.File;
import java.io.FileOutputStream;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class Utils {


    public static final int DEFAULT_PORT = 3000;
    public static final String KEY_PORT = "port";
    public static final String USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";
    private static MainActivity sContext;







    public static WebView initializeWebView() {
        WebView webView = new WebView(sContext);
        setWebView(webView);
        webView.addJavascriptInterface(new WebAppInterface(sContext), "NativeAndroid");
        webView.setWebViewClient(new CustomWebViewClient(sContext));
        webView.setWebChromeClient(new CustomWebChromeClient(sContext));
        sContext.setContentView(webView);
        return webView;
    }

    public static void launchServer() {
        Intent intent = new Intent(sContext, ServerService.class);
        sContext.startService(intent);
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

    public static void setWebView(WebView webView) {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAppCacheEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(USER_AGENT);
    }
}
