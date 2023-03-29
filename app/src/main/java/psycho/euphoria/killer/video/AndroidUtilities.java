package psycho.euphoria.killer.video;


import android.graphics.Color;
import android.graphics.Rect;
import android.graphics.RectF;
import android.os.Handler;

import java.util.regex.Matcher;

import psycho.euphoria.killer.BuildConfig;

// https://github.com/DrKLO/Telegram/blob/master/TMessagesProj/src/main/java/org/telegram/messenger/AndroidUtilities.java
public class AndroidUtilities {
    public static float density = 1;
    public static final RectF rectTmp = new RectF();
    static Handler applicationHandler;

    public static void cancelRunOnUIThread(Runnable runnable) {
        if (applicationHandler == null) {
            return;
        }
        applicationHandler.removeCallbacks(runnable);
    }

    public static float clamp(float value, float min, float max) {
        if (value < min) {
            return min;
        } else if (value > max) {
            return max;
        }
        return value;
    }

    public static int blendARGB(int color1, int color2,
                                float ratio) {
        final float inverseRatio = 1 - ratio;
        float a = Color.alpha(color1) * inverseRatio + Color.alpha(color2) * ratio;
        float r = Color.red(color1) * inverseRatio + Color.red(color2) * ratio;
        float g = Color.green(color1) * inverseRatio + Color.green(color2) * ratio;
        float b = Color.blue(color1) * inverseRatio + Color.blue(color2) * ratio;
        return Color.argb((int) a, (int) r, (int) g, (int) b);
    }

    public static int dp(float value) {
        if (value == 0) {
            return 0;
        }
        return (int) Math.ceil(density * value);
    }

    public static int setAlphaComponent(int color,
                                        int alpha) {
        if (alpha < 0 || alpha > 255) {
            throw new IllegalArgumentException("alpha must be between 0 and 255.");
        }
        return (color & 0x00ffffff) | (alpha << 24);
    }

    public static float lerp(float a, float b, float f) {
        return a + f * (b - a);
    }

    public static double lerp(double a, double b, float f) {
        return a + f * (b - a);
    }

    public static float lerp(float[] ab, float f) {
        return lerp(ab[0], ab[1], f);
    }

    public static void lerp(RectF a, RectF b, float f, RectF to) {
        if (to != null) {
            to.set(
                    AndroidUtilities.lerp(a.left, b.left, f),
                    AndroidUtilities.lerp(a.top, b.top, f),
                    AndroidUtilities.lerp(a.right, b.right, f),
                    AndroidUtilities.lerp(a.bottom, b.bottom, f)
            );
        }
    }

    public static void lerp(Rect a, Rect b, float f, Rect to) {
        if (to != null) {
            to.set(
                    AndroidUtilities.lerp(a.left, b.left, f),
                    AndroidUtilities.lerp(a.top, b.top, f),
                    AndroidUtilities.lerp(a.right, b.right, f),
                    AndroidUtilities.lerp(a.bottom, b.bottom, f)
            );
        }
    }

    public static int lerp(int a, int b, float f) {
        return (int) (a + f * (b - a));
    }

    public static float lerpAngle(float a, float b, float f) {
        float delta = ((b - a + 360 + 180) % 360) - 180;
        return (a + delta * f + 360) % 360;
    }

    public static void runOnUIThread(Runnable runnable, long delay) {
        if (applicationHandler == null) {
            return;
        }
        if (delay == 0) {
            applicationHandler.post(runnable);
        } else {
            applicationHandler.postDelayed(runnable, delay);
        }
    }

    public static Integer parseInt(CharSequence value) {
        if (value == null) {
            return 0;
        }
        int val = 0;
        try {
            int start = -1, end;
            for (end = 0; end < value.length(); ++end) {
                char character = value.charAt(end);
                boolean allowedChar = character == '-' || character >= '0' && character <= '9';
                if (allowedChar && start < 0) {
                    start = end;
                } else if (!allowedChar && start >= 0) {
                    end++;
                    break;
                }
            }
            if (start >= 0) {
                String str = value.subSequence(start, end).toString();
//                val = parseInt(str);
                val = Integer.parseInt(str);
            }
        } catch (Exception ignore) {
        }
        return val;
    }

    public static void runOnUIThread(Runnable runnable) {
        runOnUIThread(runnable, 0);
    }

    public static void setApplicationHandler(Handler applicationHandler) {
        AndroidUtilities.applicationHandler = applicationHandler;
    }

}