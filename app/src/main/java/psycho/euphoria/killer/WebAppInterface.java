package psycho.euphoria.killer;

import android.app.DownloadManager;
import android.app.DownloadManager.Request;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.net.Uri;
import android.os.Environment;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.inputmethod.InputMethodManager;
import android.webkit.JavascriptInterface;

import com.arthenica.ffmpegkit.FFmpegKit;
import com.arthenica.ffmpegkit.FFmpegSession;
import com.arthenica.ffmpegkit.FFmpegSessionCompleteCallback;
import com.arthenica.ffmpegkit.FFprobeKit;
import com.arthenica.ffmpegkit.FFprobeSession;
import com.arthenica.ffmpegkit.LogCallback;
import com.arthenica.ffmpegkit.ReturnCode;
import com.arthenica.ffmpegkit.SessionState;
import com.arthenica.ffmpegkit.Statistics;
import com.arthenica.ffmpegkit.StatisticsCallback;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.Proxy.Type;
import java.net.URL;
import java.util.zip.GZIPInputStream;

import psycho.euphoria.killer.video.PlayerActivity;
import psycho.euphoria.killer.video.VideoListActivity;

import static psycho.euphoria.killer.ServerService.DEFAULT_PORT;
import static psycho.euphoria.killer.ServerService.KEY_PORT;
import static psycho.euphoria.killer.utils.LaunchServer.launchServer;

public class WebAppInterface {

    private MainActivity mContext;
    SharedPreferences mSharedPreferences;

    public WebAppInterface(MainActivity context) {
        mContext = context;
        mSharedPreferences = PreferenceManager.getDefaultSharedPreferences(context);
    }

    public void check(String uri) {
        try {
            HttpURLConnection c = (HttpURLConnection) new URL(uri).openConnection();
            c.addRequestProperty("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36");
            c.addRequestProperty("Referer", "https://www.ixigua.com/embed/?group_id=7187727505476977210&autoplay=0&wid_try=1");
            c.addRequestProperty("Cookie", "MONITOR_WEB_ID=08ba8ce2-7ae9-4ca7-b286-768b36bb67bb; ttwid=1%7C4Sq4ClTk2TuXZrHMYMak2LaZIKO4AfMX6UQ1Bt071zg%7C1614514848%7C163163a1f5ccaec792b69a9525fb9c1e993f07db8963d4e5a515711478920169; ixigua-a-s=0; SEARCH_CARD_MODE=6934288451864888839_1");
            Log.e("B5aOx2", String.format("check, %s", c.getResponseCode()));
        } catch (Exception e) {
        }
    }

    @JavascriptInterface
    public void documents() {
        mContext.runOnUiThread(() -> {
            mContext.getWebView().loadUrl(String.format("http://%s:3000/notes/notes", Shared.getDeviceIP(mContext)));
        });
    }

    @JavascriptInterface
    public void downloadFile(String fileName, String uri) {
        new Thread(() -> {
            check(uri);
        }).start();
        try {
            DownloadManager dm = (DownloadManager) mContext.getSystemService(Context.DOWNLOAD_SERVICE);
            Request request = new Request(Uri.parse(uri));
//            request.setAllowedNetworkTypes(DownloadManager.Request.NETWORK_WIFI | DownloadManager.Request.NETWORK_MOBILE)
//                    .setAllowedOverRoaming(false)
//                    .setTitle(fileName)
//                    .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_ONLY_COMPLETION)
//                    .setVisibleInDownloadsUi(false);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
            dm.enqueue(request);
        } catch (Exception ignored) {
            Log.e("B5aOx2", String.format("downloadFile, %s", ignored.getMessage()));
        }

    }

    @JavascriptInterface
    public void generateVideoThumbnails(String dir) {
        Log.e("B5aOx2", String.format("generateVideoThumbnails, %s", dir));
        generateVideoThumbnails(new File(dir)).start();
    }

    public static Thread generateVideoThumbnails(File dir) {
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

    @JavascriptInterface
    public String getString(String key) {
        return mSharedPreferences.getString(key, "");
    }

    @JavascriptInterface
    public void notes() {
        mContext.runOnUiThread(() -> {
            mContext.getWebView().loadUrl(String.format("http://%s:3000/notes/notes?article=", Shared.getDeviceIP(mContext)));
        });
    }

    @JavascriptInterface
    public void openFile(String path) {
        mContext.runOnUiThread(() -> {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.fromFile(new File(path)));
            mContext.startActivity(Intent.createChooser(intent, "打开"));
        });
    }

    @JavascriptInterface
    public void openPage() {
        CharSequence str = Shared.getText(mContext);
        if (str == null) {
            return;
        }
        mContext.runOnUiThread(() -> {
            mContext.getWebView().loadUrl(str.toString());
        });
    }

    @JavascriptInterface
    public void playVideo() {
        CharSequence str = Shared.getText(mContext);
        if (str == null) {
            return;
        }
        // Log.e("B5aOx2", String.format("playVideo, %s", str));
        PlayerActivity.launchActivity(mContext, str.toString(), null);
    }

    @JavascriptInterface
    public String probe(String path) {
        FFprobeSession session = FFprobeKit.execute(String.format("-hide_banner -i \"%s\"", path));
        if (!ReturnCode.isSuccess(session.getReturnCode())) {
            return null;
        }
        return session.getOutput();
    }

    @JavascriptInterface
    public String readText() {
        ClipboardManager clipboard = (ClipboardManager) mContext.getSystemService(Context.CLIPBOARD_SERVICE);
        ClipData clipData = clipboard.getPrimaryClip();
        if (clipData.getItemCount() > 0) {
            CharSequence sequence = clipboard.getPrimaryClip().getItemAt(0).getText();
            if (sequence != null) return sequence.toString();
        }
        return null;
    }

    // https://github.com/arthenica/ffmpeg-kit/tree/main/android
    @JavascriptInterface
    public void runFFmpeg(String cmd) {
        FFmpegKit.executeAsync(cmd, session -> {
            SessionState state = session.getState();
            ReturnCode returnCode = session.getReturnCode();
            // CALLED WHEN SESSION IS EXECUTED
        }, log -> {
            // CALLED WHEN SESSION PRINTS LOGS
        }, statistics -> {
            // CALLED WHEN SESSION GENERATES STATISTICS
        });
    }

    @JavascriptInterface
    public void serverHome() {
        mContext.runOnUiThread(() -> {
            mContext.getWebView().loadUrl("http://" + Shared.getDeviceIP(mContext) + ":" +
                    mSharedPreferences.getInt(
                            KEY_PORT, DEFAULT_PORT
                    ));
        });
    }

    @JavascriptInterface
    public void setString(String key, String value) {
        mSharedPreferences.edit().putString(key, value).apply();
    }

    @JavascriptInterface
    public void share(String path) {
        try {
            mContext.startActivity(Shared.buildSharedIntent(mContext, new File(path)));
        } catch (Exception ignored) {
            Log.e("B5aOx2", String.format("share, %s", ignored));
        }
    }

    @JavascriptInterface
    public void startServer() {
        launchServer(mContext);
    }

    @JavascriptInterface
    public void switchInputMethod() {
        ((InputMethodManager) mContext.getSystemService(Context.INPUT_METHOD_SERVICE))
                .showInputMethodPicker();
    }

    @JavascriptInterface
    public String translate(String s) {
        final StringBuilder sb = new StringBuilder();
        try {
            Thread thread = new Thread(() -> {
                String uri = "http://translate.google.com/translate_a/single?client=gtx&sl=auto&tl="
                        + "zh" + "&dt=t&dt=bd&ie=UTF-8&oe=UTF-8&dj=1&source=icon&q=" + Uri.encode(s);
                try {
                    HttpURLConnection h = (HttpURLConnection) new URL(uri).openConnection(
                            new Proxy(Type.HTTP, new InetSocketAddress("127.0.0.1", 10809))
                    );
                    h.addRequestProperty("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36 Edg/88.0.705.74");
                    h.addRequestProperty("Accept-Encoding", "gzip, deflate, br");
                    String line = null;
                    BufferedReader reader = new BufferedReader(new InputStreamReader(
                            new GZIPInputStream(h.getInputStream())
                    ));
                    StringBuilder sb1 = new StringBuilder();
                    while ((line = reader.readLine()) != null) {
                        sb1.append(line).append('\n');
                    }
                    JSONObject object = new JSONObject(sb1.toString());
                    JSONArray array = object.getJSONArray("sentences");
                    for (int i = 0; i < array.length(); i++) {
                        sb.append(array.getJSONObject(i).getString("trans"));
                    }
                } catch (Exception e) {
                }
            });
            thread.start();
            thread.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return sb.toString();
    }

    @JavascriptInterface
    public void videoList() {
        Intent intent = new Intent(mContext, VideoListActivity.class);
        mContext.startActivity(intent);
    }

    @JavascriptInterface
    public void writeText(String text) {
        ClipboardManager clipboard = (ClipboardManager) mContext.getSystemService(Context.CLIPBOARD_SERVICE);
        ClipData clip = ClipData.newPlainText("demo", text);
        clipboard.setPrimaryClip(clip);
    }

}