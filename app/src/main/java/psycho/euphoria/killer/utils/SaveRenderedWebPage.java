package psycho.euphoria.killer.utils;

import android.content.Context;
import android.os.Environment;

import java.io.File;

import psycho.euphoria.killer.MainActivity;

public class SaveRenderedWebPage {
    public static void saveRenderedWebPage(MainActivity context) {
        File d = new File(Environment.getExternalStorageDirectory(), "web.mht");
        context.getWebView().saveWebArchive(
                d.getAbsolutePath()
        );
    }
}