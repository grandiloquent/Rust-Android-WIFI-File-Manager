package psycho.euphoria.killer.video;

import android.app.Activity;
import android.media.MediaPlayer;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Utils {

    public static void bindDeleteButton(Activity context) {
    }

    public static void bindLoopPlayback() {
    }

    public static int parseMilliseconds(String value) {
        Pattern pattern = Pattern.compile("\\b(\\d+ )+\\d+\\b");
        Matcher matcher = pattern.matcher(value);
        if (matcher.matches()) {
            String[] pieces = value.split(" ");
            int total = 0;
            for (int i = pieces.length - 1, j = 0; i > -1; i--, j++) {
                total += Integer.parseInt(pieces[i]) * Math.pow(60, j);
            }
            total *= 1000;
            return total;
        }
        return 0;
    }
}
