package psycho.euphoria.killer;

import android.content.Context;
import android.graphics.Bitmap;
import android.net.Uri;
import android.util.Log;
import android.webkit.CookieManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;


public class CustomWebViewClient extends WebViewClient {
    private final String[] mBlocks = new String[]{
            ":.realsrv.com/",
            "://fans.91p20.space/",
            "://rpc-php.trafficfactory.biz/",
            "google-analytics.com/",
            "://www.gstatic.com/",
            "://widgets.pinterest.com/",
            ".addthis.com/",
            "/ads/",
//            "://i.imgur.com/",
            "://onclickgenius.com/",
            "://inpagepush.com/",
            ".doppiocdn.com/",
            ".googleapis.com/",
            "adsco.re/",
            "challenges.cloudflare.com/",
            "static.cloudflareinsights.com/",
            "highrevenuegate.com/",
            "googletagmanager.com/",
            "www.film1k.com/wp-content/themes/",
//            "/litespeed/js/",
//            "betteradsystem.com/",
            "cloudfront.net/angular-google-analytics"
    };
    private final WebResourceResponse mEmptyResponse = new WebResourceResponse(
            "text/plain",
            "UTF-8",
            new ByteArrayInputStream("".getBytes())
    );
    private String mJavaScript;
    private final MainActivity mContext;
    String mJsCode;

    public CustomWebViewClient(MainActivity context) {
//        mClientInterface = clientInterface;
//        try {
//            mJavaScript = FileShare.readText(clientInterface.getContext().getAssets().open("youtube.js"));
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
        mContext = context;
        mJsCode = Shared.readAssetAsString(context, "adblock.js");
    }


    @Override
    public void onPageFinished(WebView view, String url) {
        //  String cookie;
//        if (url.startsWith("https://www.xvideos.com/") && (cookie = CookieManager.getInstance().getCookie(url)) != null) {
//            mContext.setString(MainActivity.KEY_XVIDEOS_COOKIE, cookie);
//        }
        //view.evaluateJavascript(mJsCode, null);
    }


    @Override
    @SuppressWarnings("deprecation")
    public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
//        if (Arrays.stream(mBlocks).anyMatch(url::contains)) {
//            return mEmptyResponse;
//        }
       // Log.e("B5aOx2", String.format("shouldInterceptRequest, %s", url));
        if (url.contains(".m3u8") || url.contains(".m3u8?")) {
            Shared.setText(mContext, url);
            mContext.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Toast.makeText(mContext, "解析到视频地址", Toast.LENGTH_SHORT).show();
                }
            });
        }
        return super.shouldInterceptRequest(view, url);
    }


    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        String url = request.getUrl().toString();
        if (url.equals("about:blank")||url.contains("glersakr.com")) return false;
        if ((url.startsWith("https://") || url.startsWith("http://") )) {
            view.loadUrl(url);
        }
        return true;
    }
}