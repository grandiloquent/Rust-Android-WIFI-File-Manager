package psycho.euphoria.killer;

import android.Manifest.permission;
import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.res.AssetManager;
import android.net.Uri;
import android.os.Build.VERSION;
import android.os.Build.VERSION_CODES;
import android.os.Bundle;
import android.os.Environment;
import android.preference.PreferenceManager;
import android.provider.Settings;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.inputmethod.InputMethodManager;
import android.webkit.WebSettings;
import android.webkit.WebView;

import java.io.File;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import psycho.euphoria.killer.Shared.Listener;
import psycho.euphoria.killer.tasks.DownloaderService;
import psycho.euphoria.killer.video.PlayerActivity;
import psycho.euphoria.killer.video.VideoListActivity;

import static psycho.euphoria.killer.video.PlayerActivity.*;

public class MainActivity extends Activity {
    public static final String FILE_ANDROID_ASSET_HOME_INDEX_HTML = "file:///android_asset/home/index.html";
    public static final String USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";

    static {
/*
加载编译Rust代码后得到共享库。它完整的名称为librust.so
  */
        System.loadLibrary("rust");
    }

    SharedPreferences mSharedPreferences;
    WebView mWebView;

    public WebView getWebView() {
        return mWebView;
    }

    /*
    启动使用 Rust 编写的服务器。host由主机名和端口组成。例如192.168.8.55:3000。其中主机名是设备在局域网中的IP，使用它可以在局域网的设备之间共享数据。例如连接到一个Wi-Fi的电脑和手机
      */
    public static native void startServer(AssetManager assetManager, String host, int port);

    private void downloadM3u8Video() {
        CharSequence url = Shared.getText(this);
        if (url == null) return;
        Shared.openTextContentDialog(this, "Download", new Listener() {
            @Override
            public void onSuccess(String value) {
                launchDownloadService(value.trim(), url.toString());
            }
        });
    }

    private void initialize() {
        mSharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);
        requestStorageManagerPermission();
//        launchActivity(this, "/storage/emulated/0/MP4/7.mp4", null);
        initializeWebView();
        String lastedAddress = mSharedPreferences.getString("address", null);
        if (lastedAddress != null) {
            mWebView.loadUrl(lastedAddress);
        }
        mWebView.loadUrl(FILE_ANDROID_ASSET_HOME_INDEX_HTML);

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

    private void launchDownloadService(String title, String url) {
        Intent service = new Intent(this, DownloaderService.class);
        service.putExtra(DownloaderService.EXTRA_VIDEO_TITLE, title);
        service.putExtra(DownloaderService.EXTRA_VIDEO_ADDRESS, url);
        startService(service);
    }

    private void mergeVideo() {
        Intent service = new Intent(this, DownloaderService.class);
        service.setAction("merge");
        startService(service);
    }


    private void openHomePage() {
        mWebView.loadUrl(FILE_ANDROID_ASSET_HOME_INDEX_HTML);

    }


    private void refresh() {
        mWebView.clearCache(true);
        mWebView.clearHistory();
        mWebView.clearFormData();
        mWebView.reload();
    }

    private void requestStorageManagerPermission() {
        if (VERSION.SDK_INT >= VERSION_CODES.R) {
            if (!Environment.isExternalStorageManager()) {
                try {
                    Uri uri = Uri.parse("package:" + BuildConfig.APPLICATION_ID);
                    Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, uri);
                    startActivity(intent);
                } catch (Exception ex) {
                    Intent intent = new Intent();
                    intent.setAction(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION);
                    startActivity(intent);
                }
            }
        }
    }

    private void restartService() {
        Intent service = new Intent(this, DownloaderService.class);
        service.setAction("stop");
        startService(service);
    }

    private void saveRenderedWebPage() {
        File d = new File(Environment.getExternalStorageDirectory(), "web.mht");
        mWebView.saveWebArchive(
                d.getAbsolutePath()
        );
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Actions.setContext(this);



        initialize();
    }

    @Override
    protected void onPause() {
        if (mWebView != null) {
            mSharedPreferences.edit().putString("address", mWebView.getUrl()).apply();
        }
        super.onPause();
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

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        menu.add(0, 1, 0, "刷新");
        menu.add(0, 3, 0, "保存页面");
        menu.add(0, 6, 0, "首页");
        menu.add(0, 7, 0, "复制");
        menu.add(0, 5, 0, "退出");
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case 1:
                refresh();
                break;
            case 3:
                saveRenderedWebPage();
                break;
            case 5:
                restartService();
                break;
            case 6:
                openHomePage();
                break;
            case 7:
                Shared.setText(this, mWebView.getUrl());
                break;

        }
        return super.onOptionsItemSelected(item);
    }
}