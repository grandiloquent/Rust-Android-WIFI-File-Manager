
package psycho.euphoria.killer;

import android.Manifest.permission;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.net.Uri;
import android.os.Build.VERSION;
import android.os.Build.VERSION_CODES;
import android.os.Environment;
import android.os.StrictMode;
import android.provider.Settings;
import android.webkit.WebSettings;
import android.webkit.WebView;

import java.io.File;
import java.io.FileOutputStream;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class Utils {


    public static final int DEFAULT_PORT = 3000;
    public static final String KEY_PORT = "port";
    private static MainActivity sContext;









    public static void launchServer() {
        Intent intent = new Intent(sContext, ServerService.class);
        sContext.startService(intent);
    }





    public static void saveRenderedWebPage() {
        File d = new File(Environment.getExternalStorageDirectory(), "web.mht");
        sContext.getWebView().saveWebArchive(
                d.getAbsolutePath()
        );
    }

    public static void setContext(MainActivity context) {
        sContext = context;
    }


}
