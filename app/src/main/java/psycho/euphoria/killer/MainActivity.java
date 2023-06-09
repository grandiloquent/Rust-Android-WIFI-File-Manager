package psycho.euphoria.killer;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.Bitmap.Config;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Paint.Style;
import android.graphics.Rect;
import android.graphics.RectF;
import android.os.Bundle;
import android.os.Environment;
import android.preference.PreferenceManager;
import android.text.TextPaint;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.inputmethod.InputMethodManager;
import android.webkit.WebView;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static psycho.euphoria.killer.utils.AroundFileUriExposedException.aroundFileUriExposedException;
import static psycho.euphoria.killer.utils.InitializeWebView.initializeWebView;
import static psycho.euphoria.killer.utils.LaunchServer.launchServer;
import static psycho.euphoria.killer.utils.Refresh.refresh;
import static psycho.euphoria.killer.utils.RequestPermission.requestPermission;
import static psycho.euphoria.killer.utils.RequestStorageManagerPermission.requestStorageManagerPermission;
import static psycho.euphoria.killer.utils.RestartService.restartService;
import static psycho.euphoria.killer.utils.SaveRenderedWebPage.saveRenderedWebPage;

public class MainActivity extends Activity {

    static {
/*
加载编译Rust代码后得到共享库。它完整的名称为librust.so
  */
        System.loadLibrary("rust");
    }

    SharedPreferences mSharedPreferences;
    WebView mWebView;
    BroadcastReceiver mBroadcastReceiver;
    private String mAddress;

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

    private void initialize() {
        mBroadcastReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                mAddress = String.format("http://%s:%d", Shared.getDeviceIP(MainActivity.this), mSharedPreferences.getInt("port", 0));
                loadStartPage(MainActivity.this, false);
            }
        };
        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(getPackageName() + ".server_started");
        registerReceiver(mBroadcastReceiver, intentFilter);
        aroundFileUriExposedException();
        requestStorageManagerPermission(this);
        mSharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);
        mWebView = initializeWebView(this);
        //Secret.populateSettings(this);
        launchServer(this);

    }


    private void loadStartPage(MainActivity context, boolean isHomePage) {
        if (isHomePage) {
            Log.e("B5aOx2", String.format("loadStartPage, %s", mAddress));
            context.getWebView().loadUrl(mAddress);
        } else {
            String lastedAddress = context.getSharedPreferences().getString("address", mAddress);
            if (lastedAddress != null) {
                context.getWebView().loadUrl(lastedAddress);
            }
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (!requestPermission(this))
            initialize();
    }

    @Override
    protected void onPause() {
        if (mWebView != null) {
            mSharedPreferences.edit().putString("address", mWebView.getUrl()).apply();
        }
        super.onPause();
    }

    @Override
    protected void onStop() {
        super.onStop();
        if (mBroadcastReceiver != null) {
            unregisterReceiver(mBroadcastReceiver);
            mBroadcastReceiver = null;
        }

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
        menu.add(0, 2, 0, "切换输入法");
        menu.add(0, 5, 0, "退出");
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case 1:
                refresh(this);
                break;
            case 3:
                saveRenderedWebPage(this);
                break;
            case 2:
                ((InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE))
                        .showInputMethodPicker();
                break;
            case 5:
                restartService(this);
                break;
            case 6:
                loadStartPage(this, true);
                break;
            case 7:
                Shared.setText(this, mWebView.getUrl());
                break;

        }
        return super.onOptionsItemSelected(item);
    }
}