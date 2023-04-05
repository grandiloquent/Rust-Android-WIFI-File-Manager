package psycho.euphoria.killer;

import android.Manifest.permission;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build.VERSION;
import android.os.Build.VERSION_CODES;
import android.os.Environment;
import android.os.StrictMode;
import android.provider.Settings;
import android.webkit.WebSettings;
import android.webkit.WebView;

import java.io.File;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class Actions {
    public static final int DEFAULT_PORT = 3000;
    public static final int ITEM_ID_REFRESH = 1;
    public static final String KEY_PORT = "port";
    public static final String USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";
    private static final String FILE_ANDROID_ASSET_HOME_INDEX_HTML = "file:///android_asset/home/index.html";
    private static MainActivity sContext;

    public static void aroundFileUriExposedException() {
        StrictMode.VmPolicy.Builder builder = new StrictMode.VmPolicy.Builder();
        StrictMode.setVmPolicy(builder.build());
    }

    public static void clearWebViewCachesCustom() {
        try {
            String dataDir = sContext.getPackageManager().getPackageInfo(sContext.getPackageName(), 0).applicationInfo.dataDir;
            new File(dataDir + "/app_webview/").delete();
        } catch (Exception e) {
            e.printStackTrace();
            e.getSuppressed();
        }
    }

    public static List<String> filterNeedPermissions(Context context) {
        List<String> needPermissions;
        needPermissions = Arrays.stream(new String[]{
                        permission.INTERNET,
                        permission.ACCESS_WIFI_STATE,
                        permission.READ_EXTERNAL_STORAGE,
                }).filter(permission -> context.checkSelfPermission(permission) != PackageManager.PERMISSION_GRANTED)
                .collect(Collectors.toList());
        if (VERSION.SDK_INT <= 28 && context.checkSelfPermission(permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            needPermissions.add(permission.WRITE_EXTERNAL_STORAGE);
        } else if (VERSION.SDK_INT >= VERSION_CODES.P && (context.checkSelfPermission(permission.FOREGROUND_SERVICE) != PackageManager.PERMISSION_GRANTED)) {
            needPermissions.add(permission.FOREGROUND_SERVICE);
        }
        return needPermissions;
    }

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
        List<String> needPermissions = filterNeedPermissions(sContext);
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

    public static void setWebView(WebView webView) {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAppCacheEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(USER_AGENT);
    }
}