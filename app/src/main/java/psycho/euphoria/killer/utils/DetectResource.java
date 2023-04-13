package psycho.euphoria.killer.utils;

import android.content.Context;
import android.widget.Toast;

import psycho.euphoria.killer.MainActivity;
import psycho.euphoria.killer.Shared;

public class DetectResource {
    public static void detectResource(MainActivity context, String url) {
        if (!url.contains("ping.gif?") && (url.contains(".m3u8") || url.contains(".m3u8?")
                || url.contains("cdn.me"))) {
            Shared.setText(context, url);
            context.runOnUiThread(() -> Toast.makeText(context, "解析到视频地址", Toast.LENGTH_SHORT).show());
        }
    }
}