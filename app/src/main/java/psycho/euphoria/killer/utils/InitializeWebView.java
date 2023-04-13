package psycho.euphoria.killer.utils;

import android.webkit.WebView;

import psycho.euphoria.killer.CustomWebChromeClient;
import psycho.euphoria.killer.CustomWebViewClient;
import psycho.euphoria.killer.MainActivity;
import psycho.euphoria.killer.WebAppInterface;

import static psycho.euphoria.killer.utils.SetWebView.setWebView;

public class InitializeWebView {
  
    public static WebView initializeWebView(MainActivity context) {
        WebView webView = new WebView(context);
        setWebView(webView);
        webView.addJavascriptInterface(new WebAppInterface(context), "NativeAndroid");
        webView.setWebViewClient(new CustomWebViewClient(context));
        webView.setWebChromeClient(new CustomWebChromeClient(context));
        context.setContentView(webView);
        return webView;
    }
}