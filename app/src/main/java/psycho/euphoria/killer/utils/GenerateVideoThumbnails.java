package psycho.euphoria.killer.utils;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;

import java.io.File;
import java.io.FileOutputStream;

import psycho.euphoria.killer.MainActivity;
import psycho.euphoria.killer.Shared;

public class GenerateVideoThumbnails {
    public static Thread generateVideoThumbnails(File dir) {
    // GenerateVideoThumbnails.generateVideoThumbnails(MainActivity.this);
        return new Thread(() -> {
            File parent = new File(dir, ".images");
            if (!parent.exists()) {
                parent.mkdirs();
            }
            File[] files = dir.listFiles(file -> file.isFile() && !file.getName().endsWith(".srt"));
            if (files != null) {
                for (File file : files) {
                    File output = new File(parent, file.getName());
                    if (output.exists()) continue;
                    try {
                        Bitmap bitmap = Shared.createVideoThumbnail(file.getAbsolutePath());
                        if (bitmap != null) {
                            FileOutputStream fileOutputStream = new FileOutputStream(output);
                            bitmap.compress(CompressFormat.JPEG, 75, fileOutputStream);
                            bitmap.recycle();
                            fileOutputStream.close();
                        }

                    } catch (Exception ignored) {
                    }

                }
            }
        });
    }
}