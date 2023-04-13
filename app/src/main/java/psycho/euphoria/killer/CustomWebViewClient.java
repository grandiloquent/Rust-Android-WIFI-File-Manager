package psycho.euphoria.killer;

import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import psycho.euphoria.killer.utils.ShouldOverrideUrlLoading;


public class CustomWebViewClient extends WebViewClient {


    private final MainActivity mContext;

    public CustomWebViewClient(MainActivity context) {
        mContext = context;
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
        return super.shouldInterceptRequest(view, url);

    }


    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        ShouldOverrideUrlLoading.shouldOverrideUrlLoading(view, request);
        return true;
    }
}