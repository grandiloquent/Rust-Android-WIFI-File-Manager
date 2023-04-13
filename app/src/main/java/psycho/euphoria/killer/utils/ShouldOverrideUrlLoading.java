package psycho.euphoria.killer.utils;

import android.content.Context;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;

import psycho.euphoria.killer.MainActivity;

public class ShouldOverrideUrlLoading {
    public static void shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        String url = request.getUrl().toString();
        if ((url.startsWith("https://") || url.startsWith("http://") || url.startsWith("file://"))) {
            view.loadUrl(url);
        }
    }
}