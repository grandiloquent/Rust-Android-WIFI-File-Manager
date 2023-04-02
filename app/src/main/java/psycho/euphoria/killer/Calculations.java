package psycho.euphoria.killer;

import android.Manifest.permission;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build.VERSION;
import android.os.Build.VERSION_CODES;
import android.webkit.WebSettings;
import android.webkit.WebView;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class Calculations {
    public static final String USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";
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
    public static void launchServer(Context context) {
        Intent intent = new Intent(context, ServerService.class);
        context.startService(intent);
    }
    public static void setWebView(WebView webView){
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAppCacheEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(USER_AGENT);
    }
}