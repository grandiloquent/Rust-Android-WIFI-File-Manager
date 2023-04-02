package psycho.euphoria.killer;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.AssetManager;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.view.Menu;
import android.view.MenuItem;
import android.webkit.WebView;

import psycho.euphoria.killer.Shared.Listener;
import psycho.euphoria.killer.tasks.DownloaderService;

public class MainActivity extends Activity {

    static {
/*
加载编译Rust代码后得到共享库。它完整的名称为librust.so
  */
        System.loadLibrary("rust");
    }

    SharedPreferences mSharedPreferences;
    WebView mWebView;

    public SharedPreferences getSharedPreferences() {
        return mSharedPreferences;
    }

    public WebView getWebView() {
        return mWebView;
    }

    /*
    启动使用 Rust 编写的服务器。host由主机名和端口组成。例如192.168.8.55:3000。其中主机名是设备在局域网中的IP，使用它可以在局域网的设备之间共享数据。例如连接到一个Wi-Fi的电脑和手机
      */
    public static native void startServer(ServerService service, AssetManager assetManager, String host, int port);

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
        Actions.requestStorageManagerPermission();
        mSharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);
        mWebView = Actions.initializeWebView();
        Actions.loadStartPage(false);
       // Actions.launchServer();
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


    private void refresh() {
        mWebView.clearCache(true);
        mWebView.clearHistory();
        mWebView.clearFormData();
        mWebView.reload();
    }


    private void restartService() {
        Intent service = new Intent(this, DownloaderService.class);
        service.setAction("stop");
        startService(service);
    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Actions.setContext(this);
        if (!Actions.requestPermission())
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
                Actions.saveRenderedWebPage();
                break;
            case 5:
                restartService();
                break;
            case 6:
                Actions.loadStartPage(true);
                break;
            case 7:
                Shared.setText(this, mWebView.getUrl());
                break;

        }
        return super.onOptionsItemSelected(item);
    }
}