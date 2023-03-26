package psycho.euphoria.killer;

import android.Manifest.permission;
import android.app.Activity;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build.VERSION;
import android.os.Build.VERSION_CODES;
import android.os.Bundle;
import android.os.Environment;
import android.preference.PreferenceManager;
import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import psycho.euphoria.killer.lib.RustLog;

public class MainActivity extends Activity {
    public static final int ITEM_ID_REFRESH = 1;
    public static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36";

    static {
        System.loadLibrary("rust_lib");
    }

    SharedPreferences mSharedPreferences;
    // 初始化Web组件
    WebView mWebView;

    private void initialize() {
        mSharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);
        initializeWebView();
    }

    private void initializeWebView() {
        mWebView = new WebView(this);
        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAppCacheEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(USER_AGENT);
        mWebView.addJavascriptInterface(new WebAppInterface(this), "NativeAndroid");
        mWebView.setWebViewClient(new CustomWebViewClient(this));
        mWebView.setWebChromeClient(new CustomWebChromeClient(this));
        setContentView(mWebView);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        List<String> needPermissions;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
            needPermissions = Arrays.stream(new String[]{
                            permission.INTERNET,
                            permission.ACCESS_WIFI_STATE,
                            permission.READ_EXTERNAL_STORAGE,
                    }).filter(permission -> checkSelfPermission(permission) != PackageManager.PERMISSION_GRANTED)
                    .collect(Collectors.toList());
            if (VERSION.SDK_INT <= 28 && checkSelfPermission(permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                needPermissions.add(permission.WRITE_EXTERNAL_STORAGE);
            } else if (VERSION.SDK_INT >= VERSION_CODES.P && (checkSelfPermission(permission.FOREGROUND_SERVICE) != PackageManager.PERMISSION_GRANTED)) {
                needPermissions.add(permission.FOREGROUND_SERVICE);
            }
            if (needPermissions.size() > 0) {
                requestPermissions(needPermissions.toArray(new String[0]), ITEM_ID_REFRESH);
                return;
            }
        }
        initialize();
    }

    // 在用户单击返回按键时，先尝试返回上次打开的页面
    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
            return;
        }
        super.onBackPressed();
    }
}