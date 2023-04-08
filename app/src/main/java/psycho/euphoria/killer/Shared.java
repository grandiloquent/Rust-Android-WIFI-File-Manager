package psycho.euphoria.killer;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.AlertDialog.Builder;
import android.app.DownloadManager;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager.NameNotFoundException;
import android.content.res.Configuration;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.net.Uri;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelFileDescriptor;
import android.os.storage.StorageManager;
import android.text.TextUtils;
import android.util.Log;
import android.util.TypedValue;
import android.view.View;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.MimeTypeMap;
import android.widget.EditText;
import android.widget.Toast;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.Closeable;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.InterruptedIOException;
import java.io.OutputStream;
import java.lang.reflect.Array;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Enumeration;
import java.util.Formatter;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.GZIPInputStream;

import static android.content.Context.DOWNLOAD_SERVICE;
import static java.lang.Math.max;
import static java.lang.Math.min;

public class Shared {

    // 操作成功
    public static final int SUCCESS = 0;
    private static final long INITIALCRC = 0xFFFFFFFFFFFFFFFFL;
    private static final boolean IS_DEBUG_BUILD =
            Build.TYPE.equals("eng") || Build.TYPE.equals("userdebug");
    // 换行符
    private static final String LINE_SEP = System.getProperty("line.separator");
    private static final String MASK_STRING = "********************************";
    static final long POLY64REV = 0x95AC9329AC4BC9B5L;
    private static final String TAG = "";
    private static final String TIME_DATE_PATTERN = "yyyy-MM-dd HH:mm:ss.SSS";
    public static final SimpleDateFormat DATE_FORMATTER = new SimpleDateFormat(TIME_DATE_PATTERN, new Locale("en"));
    static long[] sCrcTable = new long[256];
    private static final Object sLock = new Object();
    private static Handler sUiThreadHandler;

    static {
        // http://bioinf.cs.ucl.ac.uk/downloads/crc64/crc64.c
        long part;
        for (int i = 0; i < 256; i++) {
            part = i;
            for (int j = 0; j < 8; j++) {
                long x = ((int) part & 1) != 0 ? Shared.POLY64REV : 0;
                part = (part >> 1) ^ x;
            }
            Shared.sCrcTable[i] = part;
        }
    }

    // Throws AssertionError if the input is false.
    public static void assertTrue(boolean cond) {
        if (!cond) {
            throw new AssertionError();
        }
    }

    public static Intent buildSharedIntent(Context context, File imageFile) {
        Intent sharingIntent = new Intent(Intent.ACTION_SEND);
        if (imageFile.getName().endsWith(".mp3"))
            sharingIntent.setType("*/*");
        else
            sharingIntent.setType("video/mp4");
        Uri uri = PublicFileProvider.getUriForFile(context, "cn.kpkpkp.files", imageFile);
        //        StrictMode.VmPolicy.Builder builder = new StrictMode.VmPolicy.Builder();
//        StrictMode.setVmPolicy(builder.build());
        //sharingIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        sharingIntent.putExtra(Intent.EXTRA_STREAM, uri);
//        List<ResolveInfo> resolveInfos = context.getPackageManager().queryIntentActivities(
//                sharingIntent,
//                PackageManager.MATCH_DEFAULT_ONLY
//        );
//        for (ResolveInfo r : resolveInfos) {
//            context.grantUriPermission(r.activityInfo.packageName, uri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
//        }
        return sharingIntent;


    }

    public static int ceilLog2(float value) {
        int i;
        for (i = 0; i < 31; i++) {
            if ((1 << i) >= value) break;
        }
        return i;
    }

    // Throws NullPointerException if the input is null.
    public static <T> T checkNotNull(T object) {
        if (object == null) throw new NullPointerException();
        return object;
    }

    // Returns the input value x clamped to the range [min, max].
    public static int clamp(int x, int min, int max) {
        if (x > max) return max;
        if (x < min) return min;
        return x;
    }

    // Returns the input value x clamped to the range [min, max].
    public static float clamp(float x, float min, float max) {
        if (x > max) return max;
        if (x < min) return min;
        return x;
    }

    // Returns the input value x clamped to the range [min, max].
    public static long clamp(long x, long min, long max) {
        if (x > max) return max;
        if (x < min) return min;
        return x;
    }

    public static void close(Closeable closeable) {
        if (closeable != null) {
            try {
                closeable.close();
            } catch (IOException e) {
                // ignore
            }
        }
    }

    public static void closeSilently(Closeable c) {
        if (c == null) return;
        try {
            c.close();
        } catch (IOException t) {
            Log.w(TAG, "close fail ", t);
        }
    }

    public static void closeSilently(ParcelFileDescriptor fd) {
        try {
            if (fd != null) fd.close();
        } catch (Throwable t) {
            Log.w(TAG, "fail to close", t);
        }
    }

    public static void closeSilently(Cursor cursor) {
        try {
            if (cursor != null) cursor.close();
        } catch (Throwable t) {
            Log.w(TAG, "fail to close", t);
        }
    }

    public static int compare(long a, long b) {
        return a < b ? -1 : a == b ? 0 : 1;
    }

    public static int constrainValue(int value, int min, int max) {
        return max(min, min(value, max));
    }

    public static long constrainValue(long value, long min, long max) {
        return max(min, min(value, max));
    }

    public static String[] copyOf(String[] source, int newSize) {
        String[] result = new String[newSize];
        newSize = min(source.length, newSize);
        System.arraycopy(source, 0, result, 0, newSize);
        return result;
    }

    public static void copyStreams(InputStream inStream, OutputStream outStream) throws IOException {
        int data = -1;
        while ((data = inStream.read()) != -1) {
            outStream.write(data);
        }
    }

    /**
     * A function thats returns a 64-bit crc for string
     *
     * @param in input string
     * @return a 64-bit crc value
     */
    public static final long crc64Long(String in) {
        if (in == null || in.length() == 0) {
            return 0;
        }
        return crc64Long(getBytes(in));
    }

    public static final long crc64Long(byte[] buffer) {
        long crc = INITIALCRC;
        for (int k = 0, n = buffer.length; k < n; ++k) {
            crc = sCrcTable[(((int) crc) ^ buffer[k]) & 0xff] ^ (crc >> 8);
        }
        return crc;
    }

    public static void createDirectoryIfNotExists(String path) {
        File dir = new File(path);
        if (!dir.exists()) {
            dir.mkdirs();
        }

    }

    public static Bitmap createVideoThumbnail(String filePath) {
        // MediaMetadataRetriever is available on API Level 8
        // but is hidden until API Level 10
        Class<?> clazz = null;
        Object instance = null;
        try {
            clazz = Class.forName("android.media.MediaMetadataRetriever");
            instance = clazz.newInstance();
            Method method = clazz.getMethod("setDataSource", String.class);
            method.invoke(instance, filePath);
            // The method name changes between API Level 9 and 10.
            if (Build.VERSION.SDK_INT <= 9) {
                return (Bitmap) clazz.getMethod("captureFrame").invoke(instance);
            } else {
                byte[] data = (byte[]) clazz.getMethod("getEmbeddedPicture").invoke(instance);
                if (data != null) {
                    Bitmap bitmap = BitmapFactory.decodeByteArray(data, 0, data.length);
                    if (bitmap != null) return bitmap;
                }
                return (Bitmap) clazz.getMethod("getFrameAtTime").invoke(instance);
            }
        } catch (IllegalArgumentException ex) {
            // Assume this is a corrupt video file
        } catch (RuntimeException ex) {
            // Assume this is a corrupt video file.
        } catch (InstantiationException e) {
            Log.e(TAG, "createVideoThumbnail", e);
        } catch (InvocationTargetException e) {
            Log.e(TAG, "createVideoThumbnail", e);
        } catch (ClassNotFoundException e) {
            Log.e(TAG, "createVideoThumbnail", e);
        } catch (NoSuchMethodException e) {
            Log.e(TAG, "createVideoThumbnail", e);
        } catch (IllegalAccessException e) {
            Log.e(TAG, "createVideoThumbnail", e);
        } finally {
            try {
                if (instance != null) {
                    clazz.getMethod("release").invoke(instance);
                }
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    // This method should be ONLY used for debugging.
    public static void debug(String message, Object... args) {
        Log.v("TAG", String.format(message, args));
    }

    public static void downloadFile(Context context, String fileName, String url, String userAgent) {
        try {
            DownloadManager downloadManager = (DownloadManager) context.getSystemService(DOWNLOAD_SERVICE);
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            String cookie = CookieManager.getInstance().getCookie(url);
            request.allowScanningByMediaScanner();
            request.setTitle(fileName)
                    .setDescription("正在下载")
                    .addRequestHeader("cookie", cookie)
                    .addRequestHeader("User-Agent", userAgent)
                    .setMimeType(getFileType(context, url))
                    .setAllowedOverMetered(true)
                    .setAllowedOverRoaming(true)
                    .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE | DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
            downloadManager.enqueue(request);
            Toast.makeText(context, "开始下载", Toast.LENGTH_SHORT).show();
        } catch (Exception exception) {
            Toast.makeText(context, "下载错误", Toast.LENGTH_SHORT).show();


        }
    }

    public static String ensureNotNull(String value) {
        return value == null ? "" : value;
    }

    // Returns true if two input Object are both null or equal
    // to each other.
    public static boolean equals(Object a, Object b) {
        return (a == b) || (a == null ? false : a.equals(b));
    }

    /**
     * @return String with special XML characters escaped.
     */
    public static String escapeXml(String s) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0, len = s.length(); i < len; ++i) {
            char c = s.charAt(i);
            switch (c) {
                case '<':
                    sb.append("&lt;");
                    break;
                case '>':
                    sb.append("&gt;");
                    break;
                case '\"':
                    sb.append("&quot;");
                    break;
                case '\'':
                    sb.append("&#039;");
                    break;
                case '&':
                    sb.append("&amp;");
                    break;
                default:
                    sb.append(c);
            }
        }
        return sb.toString();
    }

    public static CommandResult execCmd(final String[] commands, final boolean isRoot, final boolean isNeedResultMsg) {
        int result = -1;
        if (commands == null || commands.length == 0) {
            return new CommandResult(result, null, null);
        }
        Process process = null;
        BufferedReader successResult = null;
        BufferedReader errorResult = null;
        StringBuilder successMsg = null;
        StringBuilder errorMsg = null;
        DataOutputStream os = null;
        try {
            process = Runtime.getRuntime().exec(isRoot ? "su" : "sh");
            os = new DataOutputStream(process.getOutputStream());
            for (String command : commands) {
                if (command == null) continue;
                os.write(command.getBytes());
                os.writeBytes(LINE_SEP);
                os.flush();
            }
            os.writeBytes("exit" + LINE_SEP);
            os.flush();
            result = process.waitFor();
            if (isNeedResultMsg) {
                successMsg = new StringBuilder();
                errorMsg = new StringBuilder();
                successResult = new BufferedReader(new InputStreamReader(process.getInputStream(), "UTF-8"));
                errorResult = new BufferedReader(new InputStreamReader(process.getErrorStream(), "UTF-8"));
                String line;
                if ((line = successResult.readLine()) != null) {
                    successMsg.append(line);
                    while ((line = successResult.readLine()) != null) {
                        successMsg.append(LINE_SEP).append(line);
                    }
                }
                if ((line = errorResult.readLine()) != null) {
                    errorMsg.append(line);
                    while ((line = errorResult.readLine()) != null) {
                        errorMsg.append(LINE_SEP).append(line);
                    }
                }
            }
        } catch (Exception e) {
        } finally {
            try {
                os.close();
                successResult.close();
                errorResult.close();
            } catch (Exception e) {
            }
            if (process != null) {
                process.destroy();
            }
        }
        return new CommandResult(
                result,
                successMsg == null ? null : successMsg.toString(),
                errorMsg == null ? null : errorMsg.toString());
    }

    public static CommandResult execCmd(final String[] commands, final boolean isRoot) {
        return execCmd(commands, isRoot, true);
    }

    public static CommandResult execCmd(final String command, final boolean isRoot) {
        return execCmd(new String[]{command}, isRoot, true);
    }

    // Throws AssertionError with the message. We had a method having the form
    //   assertTrue(boolean cond, String message, Object ... args);
    // However a call to that method will cause memory allocation even if the
    // condition is false (due to autoboxing generated by "Object ... args"),
    // so we don't use that anymore.
    public static void fail(String message, Object... args) {
        throw new AssertionError(
                args.length == 0 ? message : String.format(message, args));
    }

    public static int floorLog2(float value) {
        int i;
        for (i = 0; i < 31; i++) {
            if ((1 << i) > value) break;
        }
        return i - 1;
    }

    public static int getActionBarHeight(Context context) {
        TypedValue tv = new TypedValue();
        if (context.getTheme().resolveAttribute(android.R.attr.actionBarSize, tv, true)) {
            return TypedValue.complexToDimensionPixelSize(tv.data,
                    context.getResources().getDisplayMetrics());
        }
        return 0;
    }

    public static byte[] getBytes(String in) {
        byte[] result = new byte[in.length() * 2];
        int output = 0;
        for (char ch : in.toCharArray()) {
            result[output++] = (byte) (ch & 0xFF);
            result[output++] = (byte) (ch >> 8);
        }
        return result;
    }

    public static String getDeviceIP(Context context) {
        WifiManager wifiManager = (WifiManager) context.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        try {
            WifiInfo wifiInfo = wifiManager.getConnectionInfo();
            int rawIp = wifiInfo.getIpAddress();
            if (rawIp == 0) {
                Method method = wifiManager.getClass().getDeclaredMethod("isWifiApEnabled");
                method.setAccessible(true);
                boolean isWifiApEnabled = (boolean) method.invoke(wifiManager);
                if (isWifiApEnabled)
                    return getWifiApIpAddress();
                else
                    return "0.0.0.0";
            }
            //Log.e("B5aOx2", String.format("getDeviceIP, %s", wifiManager.getConnectionInfo().getSupplicantState().name()));
            InetAddress inetAddress = intToInetAddress(rawIp);
            return inetAddress.getHostAddress();
        } catch (Exception e) {
            return "0.0.0.0";
        }
    }

    public static String getExternalStoragePath(Context context) {
        StorageManager mStorageManager = (StorageManager) context.getSystemService(Context.STORAGE_SERVICE);
        Class<?> storageVolumeClazz = null;
        try {
            storageVolumeClazz = Class.forName("android.os.storage.StorageVolume");
            Method getVolumeList = mStorageManager.getClass().getMethod("getVolumeList");
            Method getPath = storageVolumeClazz.getMethod("getPath");
            Method isRemovable = storageVolumeClazz.getMethod("isRemovable");
            Object result = getVolumeList.invoke(mStorageManager);
            if (result == null) return null;
            final int length = Array.getLength(result);
            for (int i = 0; i < length; i++) {
                Object storageVolumeElement = Array.get(result, i);
                String path = (String) getPath.invoke(storageVolumeElement);
                Object removableObject = isRemovable.invoke(storageVolumeElement);
                if (removableObject == null) return null;
                boolean removable = (Boolean) removableObject;
                if (removable) {
                    return path;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public static String getFileType(Context context, String url) {
        ContentResolver contentResolver = context.getContentResolver();
        MimeTypeMap mimeTypeMap = MimeTypeMap.getSingleton();
        return mimeTypeMap.getExtensionFromMimeType(contentResolver.getType(Uri.parse(url)));
    }

    public static int getNavigationBarHeight(Context context, int orientation) {
        int id = context.getResources().getIdentifier(
                orientation == Configuration.ORIENTATION_PORTRAIT ? "navigation_bar_height" : "navigation_bar_height_landscape",
                "dimen", "android");
        if (id > 0) {
            return context.getResources().getDimensionPixelSize(id);
        }
        return 0;
    }

    public static String getStringForTime(StringBuilder builder, Formatter formatter, long timeMs) {
        if (timeMs == Long.MIN_VALUE + 1) {
            timeMs = 0;
        }
        long totalSeconds = (timeMs + 500) / 1000;
        long seconds = totalSeconds % 60;
        long minutes = (totalSeconds / 60) % 60;
        long hours = totalSeconds / 3600;
        builder.setLength(0);
        return hours > 0 ? formatter.format("%d:%02d:%02d", hours, minutes, seconds).toString()
                : formatter.format("%02d:%02d", minutes, seconds).toString();
    }

    public static CharSequence getText(Context context) {
        ClipboardManager clipboardManager = (ClipboardManager) context.getSystemService(Context.CLIPBOARD_SERVICE);
        ClipData clip = clipboardManager.getPrimaryClip();
        if (clip != null && clip.getItemCount() > 0) {
            return clip.getItemAt(0).getText();
        }
        return null;
    }

    public static Handler getUiThreadHandler() {
        boolean createdHandler = false;
        synchronized (sLock) {
            if (sUiThreadHandler == null) {
                sUiThreadHandler = new Handler(Looper.getMainLooper());
                createdHandler = true;
            }
        }
        if (createdHandler) {
            //TraceEvent.onUiThreadReady();
        }
        return sUiThreadHandler;
    }

    public static String getUserAgent(Context context) {
        PackageInfo packageInfo;
        try {
            packageInfo = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
        } catch (NameNotFoundException e) {
            throw new IllegalStateException("getPackageInfo failed");
        }
        return String.format("%s/%s; %s/%s/%s/%s; %s/%s/%s",
                packageInfo.packageName,
                packageInfo.versionName,
                Build.BRAND,
                Build.DEVICE,
                Build.MODEL,
                Build.ID,
                Build.VERSION.SDK_INT,
                Build.VERSION.RELEASE,
                Build.VERSION.INCREMENTAL);
    }

    public static String getValidFileName(String filename) {
        char[] invalidFileNameChars = {'\"', '<', '>', '|', '\0', (char) 1, (char) 2, (char) 3, (char) 4, (char) 5, (char) 6, (char) 7, (char) 8, (char) 9, (char) 10, (char) 11, (char) 12, (char) 13, (char) 14, (char) 15, (char) 16, (char) 17, (char) 18, (char) 19, (char) 20, (char) 21, (char) 22, (char) 23, (char) 24, (char) 25, (char) 26, (char) 27, (char) 28, (char) 29, (char) 30, (char) 31, ':', '*', '?', '\\', '/'};
        char[] buf = filename.toCharArray();
        for (char c : invalidFileNameChars) {
            for (int i = 0; i < buf.length; i++) {
                if (buf[i] == c)
                    buf[i] = ' ';
            }
        }
        return new String(buf);
    }

    public static String getWifiApIpAddress() {
        try {
            for (Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces(); en
                    .hasMoreElements(); ) {
                NetworkInterface intf = en.nextElement();
                if (intf.getName().contains("wlan")) {
                    for (Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses(); enumIpAddr
                            .hasMoreElements(); ) {
                        InetAddress inetAddress = enumIpAddr.nextElement();
                        if (!inetAddress.isLoopbackAddress()
                                && (inetAddress.getAddress().length == 4)) {
                            return inetAddress.getHostAddress();
                        }
                    }
                }
            }
        } catch (SocketException ex) {
        }
        return null;
    }

    public static boolean handleInterrruptedException(Throwable e) {
        // A helper to deal with the interrupt exception
        // If an interrupt detected, we will setup the bit again.
        if (e instanceof InterruptedIOException
                || e instanceof InterruptedException) {
            Thread.currentThread().interrupt();
            return true;
        }
        return false;
    }

    public static void hideSystemUI(Activity activity) {
//        mRoot.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
//                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
//                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
//                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
//                View.SYSTEM_UI_FLAG_LOW_PROFILE |
//                View.SYSTEM_UI_FLAG_FULLSCREEN |
//                View.SYSTEM_UI_FLAG_IMMERSIVE);
        activity.getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        activity.getActionBar().hide();
    }

    public static InetAddress intToInetAddress(int hostAddress) {
        byte[] addressBytes = {(byte) (0xff & hostAddress),
                (byte) (0xff & (hostAddress >> 8)),
                (byte) (0xff & (hostAddress >> 16)),
                (byte) (0xff & (hostAddress >> 24))};
        try {
            return InetAddress.getByAddress(addressBytes);
        } catch (UnknownHostException e) {
            throw new AssertionError();
        }
    }

    public static float interpolateAngle(
            float source, float target, float progress) {
        // interpolate the angle from source to target
        // We make the difference in the range of [-179, 180], this is the
        // shortest path to change source to target.
        float diff = target - source;
        if (diff < 0) diff += 360f;
        if (diff > 180) diff -= 360f;
        float result = source + diff * progress;
        return result < 0 ? result + 360f : result;
    }

    public static float interpolateScale(
            float source, float target, float progress) {
        return source + progress * (target - source);
    }

    public static boolean isDeviceRooted() {
        String su = "su";
        String[] locations = {"/system/bin/", "/system/xbin/", "/sbin/", "/system/sd/xbin/",
                "/system/bin/failsafe/", "/data/local/xbin/", "/data/local/bin/", "/data/local/"};
        for (String location : locations) {
            if (new File(location + su).exists()) {
                return true;
            }
        }
        return false;
    }

    public static boolean isNullOrEmpty(String exifMake) {
        return TextUtils.isEmpty(exifMake);
    }

    public static boolean isOpaque(int color) {
        return color >>> 24 == 0xFF;
    }

    public static void log(String filename, String... texts) {
        synchronized (sLock) {
            Date now = new Date();
            BufferedWriter buf;
            try {
//                File file = new File(filename);
//                if (!file.exists()) {
//                    file.createNewFile();
//                }
                FileWriter writer = new FileWriter(filename, true);
                buf = new BufferedWriter(writer);
                buf.append(DATE_FORMATTER.format(now));
                buf.append(" ");
                if (texts != null) {
                    for (String text : texts) {
                        buf.append(text).append(" ");
                    }
                }
                buf.newLine();
                buf.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    // Mask information for debugging only. It returns <code>info.toString()</code> directly
    // for debugging build (i.e., 'eng' and 'userdebug') and returns a mask ("****")
    // in release build to protect the information (e.g. for privacy issue).
    public static String maskDebugInfo(Object info) {
        if (info == null) return null;
        String s = info.toString();
        int length = min(s.length(), MASK_STRING.length());
        return IS_DEBUG_BUILD ? s : MASK_STRING.substring(0, length);
    }

    public static String matches(String strings, List<String> patterns) {
        for (String p :
                patterns) {
            Pattern pattern = Pattern.compile(p);
            Matcher matcher = pattern.matcher(strings);
            if (matcher.find()) {
                return matcher.group();
            }
        }
        return null;
    }

    public static String md5(String md5) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] array = md.digest(md5.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : array) {
                sb.append(Integer.toHexString((b & 0xFF) | 0x100).substring(1, 3));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException ignored) {
        }
        return null;
    }

    // Returns the next power of two.
    // Returns the input if it is already power of 2.
    // Throws IllegalArgumentException if the input is <= 0 or
    // the answer overflows.
    public static int nextPowerOf2(int n) {
        if (n <= 0 || n > (1 << 30)) throw new IllegalArgumentException("n is invalid: " + n);
        n -= 1;
        n |= n >> 16;
        n |= n >> 8;
        n |= n >> 4;
        n |= n >> 2;
        n |= n >> 1;
        return n + 1;
    }

    public static void openTextContentDialog(Activity activity, String title, Listener listener) {
        EditText editText = new EditText(activity);
        editText.setMaxLines(1);
        editText.requestFocus();
        AlertDialog dialog = new Builder(activity)
                .setTitle(title)
                .setView(editText)
                .setPositiveButton(android.R.string.ok, (dialogInterface, i) -> {
                    listener.onSuccess(editText.getText().toString());
                    dialogInterface.dismiss();
                }).setNegativeButton(android.R.string.cancel, (dialogInterface, which) -> {
                    dialogInterface.dismiss();
                })
                .create();
        dialog.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_VISIBLE);
        dialog.show();
    }

    public static float parseFloatSafely(String content, float defaultValue) {
        if (content == null) return defaultValue;
        try {
            return Float.parseFloat(content);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public static int parseIntSafely(String content, int defaultValue) {
        if (content == null) return defaultValue;
        try {
            return Integer.parseInt(content);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    // Returns the previous power of two.
    // Returns the input if it is already power of 2.
    // Throws IllegalArgumentException if the input is <= 0
    public static int prevPowerOf2(int n) {
        if (n <= 0) throw new IllegalArgumentException();
        return Integer.highestOneBit(n);
    }

    public static String readAssetAsString(Context context, String assetName) {
        InputStream inputStream = null;
        try {
            inputStream = context.getAssets().open(assetName);
            int size = inputStream.available();
            byte[] buffer = new byte[size];
            inputStream.read(buffer);
            inputStream.close();
            return new String(buffer, StandardCharsets.UTF_8);

        } catch (IOException e) {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException ex) {
                }
            }

        }
        return null;
    }

    /*
    public static void initialize(Context context) {
        DisplayMetrics metrics = new DisplayMetrics();
        WindowManager wm = (WindowManager)
                context.getSystemService(Context.WINDOW_SERVICE);
        wm.getDefaultDisplay().getMetrics(metrics);
        sPixelDensity = metrics.density;

    }
    public static float dpToPixel(float dp) {
        return sPixelDensity * dp;
    }

    public static int dpToPixel(int dp) {
        return Math.round(dpToPixel((float) dp));
    }

    public static int meterToPixel(float meter) {
        // 1 meter = 39.37 inches, 1 inch = 160 dp.
        return Math.round(dpToPixel(meter * 39.37f * 160));
    }
     */
    public static String readString(HttpURLConnection connection) {
        InputStream in;
        BufferedReader reader = null;
        try {
            String contentEncoding = connection.getHeaderField("Content-Encoding");
            if (contentEncoding != null && contentEncoding.equals("gzip")) {
                in = new GZIPInputStream(connection.getInputStream());
            } else {
                in = connection.getInputStream();
            }
            /*
            "implementation group": "org.brotli', name: 'dec', version: '0.1.1",
            else if (contentEncoding != null && contentEncoding.equals("br")) {
                in = new BrotliInputStream(connection.getInputStream());
            } */
            //  if (contentEncoding != null && contentEncoding.equals("br")) {
            //in = new BrotliInputStream(connection.getInputStream());
            //  }
            reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
            String line;
            StringBuilder sb = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\r\n");
            }
            return sb.toString();
        } catch (Exception ignored) {
        } finally {
            try {
                if (reader != null) reader.close();
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    public static void requestAccessibilityPermission(Context ct, Class service) {
        String cmd1 = "settings put secure enabled_accessibility_services  " + ct.getPackageName() + "/" + service.getName();
        String cmd2 = "settings put secure accessibility_enabled 1";
        String[] cmds = new String[]{cmd1, cmd2};
        execCmd(cmds, true);
    }

    public static void requestRoot() {
        execCmd("exit", true);
    }

    public static Bitmap resizeAndCropCenter(Bitmap bitmap, int size, boolean recycle) {
        int w = bitmap.getWidth();
        int h = bitmap.getHeight();
        if (w == size && h == size) return bitmap;
        // scale the image so that the shorter side equals to the target;
        // the longer side will be center-cropped.
        float scale = (float) size / min(w, h);
        Bitmap target = Bitmap.createBitmap(size, size, getConfig(bitmap));
        int width = Math.round(scale * bitmap.getWidth());
        int height = Math.round(scale * bitmap.getHeight());
        Canvas canvas = new Canvas(target);
        canvas.translate((size - width) / 2f, (size - height) / 2f);
        canvas.scale(scale, scale);
        Paint paint = new Paint(Paint.FILTER_BITMAP_FLAG | Paint.DITHER_FLAG);
        canvas.drawBitmap(bitmap, 0, 0, paint);
        if (recycle) bitmap.recycle();
        return target;
    }

    public static void runOnUiThread(Runnable r) {
        if (runningOnUiThread()) {
            r.run();
        } else {
            getUiThreadHandler().post(r);
        }
    }

    public static boolean runningOnUiThread() {
        return getUiThreadHandler().getLooper() == Looper.myLooper();
    }

    public static void setText(Context context, String string) {
        ClipboardManager clipboardManager = (ClipboardManager) context.getSystemService(Context.CLIPBOARD_SERVICE);
        clipboardManager.setPrimaryClip(ClipData.newPlainText(null, string));
    }

    public static String substring(String string, String first, String second) {
        int start = string.indexOf(first);
        if (start == -1) return null;
        start += first.length();
        int end = string.indexOf(second, start);
        if (end == -1) return null;
        return string.substring(start, end);
    }

    public static String substringAfter(String string, char delimiter) {
        int index = string.indexOf(delimiter);
        if (index != -1) return string.substring(index + 1);
        return string;
    }

    public static String substringAfter(String string, String delimiter) {
        int index = string.indexOf(delimiter);
        if (index != -1) return string.substring(index + delimiter.length());
        return string;
    }

    public static String substringAfterLast(String string, char delimiter) {
        int index = string.lastIndexOf(delimiter);
        if (index != -1) return string.substring(index + 1);
        return string;
    }

    public static String substringAfterLast(String string, String delimiter) {
        int index = string.lastIndexOf(delimiter);
        if (index != -1) return string.substring(index + delimiter.length());
        return string;
    }

    public static String substringBefore(String string, char delimiter) {
        int index = string.indexOf(delimiter);
        if (index != -1) return string.substring(0, index);
        return string;
    }

    public static String substringBefore(String string, String delimiter) {
        int index = string.indexOf(delimiter);
        if (index != -1) return string.substring(0, index);
        return string;
    }

    public static String substringBeforeLast(String string, char delimiter) {
        int index = string.lastIndexOf(delimiter);
        if (index != -1) return string.substring(0, index);
        return string;
    }

    public static String substringBeforeLast(String string, String delimiter) {
        int index = string.lastIndexOf(delimiter);
        if (index != -1) return string.substring(0, index);
        return string;
    }

    public static void swap(int[] array, int i, int j) {
        int temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    public static String toHex(byte[] data) {
        if (null == data) {
            return null;
        }
        if (data.length <= 0) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < data.length; i++) {
            String hv = Integer.toHexString(data[i]);
            if (hv.length() < 2) {
                sb.append("0");
            } else if (hv.length() == 8) {
                hv = hv.substring(6);
            }
            sb.append(hv);
        }
        return sb.toString().toLowerCase(Locale.getDefault());
    }

    public static void waitWithoutInterrupt(Object object) {
        try {
            object.wait();
        } catch (InterruptedException e) {
            Log.w(TAG, "unexpected interrupt: " + object);
        }
    }

    private static Bitmap.Config getConfig(Bitmap bitmap) {
        Bitmap.Config config = bitmap.getConfig();
        if (config == null) {
            config = Bitmap.Config.ARGB_8888;
        }
        return config;
    }

    /*
https://android.googlesource.com/platform/tools/tradefederation/+/ae241fc/src/com/android/tradefed/util/StreamUtil.java
     */
    public interface Listener {
        void onSuccess(String value);
    }

    public static class CommandResult {

        // 结果码
        public int result;
        // 成功信息
        public String successMsg;
        // 错误信息
        public String errorMsg;

        public CommandResult(final int result, final String successMsg, final String errorMsg) {
            this.result = result;
            this.successMsg = successMsg;
            this.errorMsg = errorMsg;
        }

        /**
         * 判断是否执行成功
         *
         * @return
         */
        public boolean isSuccess() {
            return result == SUCCESS;
        }

        /**
         * 判断是否执行成功(判断 errorMsg)
         *
         * @return
         */
        public boolean isSuccess2() {
            if (result == SUCCESS && (errorMsg == null || errorMsg.length() == 0)) {
                return true;
            }
            return false;
        }

        /**
         * 判断是否执行成功(判断 successMsg)
         *
         * @return
         */
        public boolean isSuccess3() {
            if (result == SUCCESS && successMsg != null && successMsg.length() != 0) {
                return true;
            }
            return false;
        }

        /**
         * 判断是否执行成功(判断 successMsg) , 并且 successMsg 是否包含某个字符串
         *
         * @param contains
         * @return
         */
        public boolean isSuccess4(final String contains) {
            if (result == SUCCESS && successMsg != null && successMsg.length() != 0) {
                if (contains != null && contains.length() != 0 && successMsg.toLowerCase().contains(contains)) {
                    return true;
                }
            }
            return false;
        }
    }
}
