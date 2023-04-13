package psycho.euphoria.killer.utils;

import android.webkit.WebResourceResponse;

import java.io.ByteArrayInputStream;
import java.util.Arrays;


public class AdBlock {
    private final static String[] mBlocks = new String[]{
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
    private final static WebResourceResponse mEmptyResponse = new WebResourceResponse(
            "text/plain",
            "UTF-8",
            new ByteArrayInputStream("".getBytes())
    );

    public static WebResourceResponse adBlock(String url) {
        if (Arrays.stream(mBlocks).anyMatch(url::contains)) {
            return mEmptyResponse;
        }
        return null;
    }
}