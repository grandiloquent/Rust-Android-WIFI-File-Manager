package psycho.euphoria.killer.tasks;

import android.app.Notification.Builder;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Environment;
import android.os.Handler;
import android.os.IBinder;
import android.os.Process;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import psycho.euphoria.killer.R;
import psycho.euphoria.killer.Shared;

import static psycho.euphoria.killer.tasks.DownloadUtils.createNotificationChannel;


public class DownloaderService extends Service implements RequestListener {
    public static final String DOWNLOAD_VIDEO = "DOWNLOAD_VIDEO";
    public static final String EXTRA_VIDEO_ADDRESS = "video_address";
    public static final String EXTRA_VIDEO_TITLE = "video_title";


    private final Handler mHandler = new Handler();
    private NotificationManager mNotificationManager;
    private ExecutorService mExecutor = Executors.newFixedThreadPool(3);
    private List<DownloaderRequest> mRequests = new ArrayList<>();


    private boolean checkFinished() {
        if (mRequests.size() == 0) {
            mNotificationManager.cancel(1);
            stopSelf();
            return true;
        }
        return false;
    }


    private List<Task> createTasks(String response, String uri, String dir) {
        String[] segments = response.split("\n");
        int sequence = 0;
        List<Task> tasks = new ArrayList<>();
        for (int i = 0; i < segments.length; i++) {
            if (segments[i].startsWith("#EXTINF:")) {
                String segment = segments[i + 1];
                Task task = new Task();
                task.uri = uri + segment;
                task.sequence = sequence++;
                task.directory = dir;
                task.filename = Shared.substringAfterLast(segment, "/");
                tasks.add(task);
                i++;
            }
        }
        return tasks;
    }

    @Override
    public void onProgress(DownloaderRequest downloaderRequest) {
        mHandler.post(() -> showNotification(downloaderRequest.getMessage()));
    }

    private void showNotification(String title) {
        Builder builder;
        builder = new Builder(this, DOWNLOAD_VIDEO);
        builder.setSmallIcon(android.R.drawable.stat_sys_download)
                .setContentTitle(title);
        mNotificationManager.notify(1, builder.build());
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel(this, DOWNLOAD_VIDEO, getString(R.string.download_video_channel));
        mNotificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
    }


    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String url = intent.getStringExtra(EXTRA_VIDEO_ADDRESS);
        String title = intent.getStringExtra(EXTRA_VIDEO_TITLE);
        File dir = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), title);
        if (!dir.isDirectory()) {
            dir.mkdir();
        }
        showNotification("创建目录：" + dir);
        new Thread(() -> {
            String response = null;
            try {
                response = DownloadUtils.getString(url);
            } catch (IOException e) {
                mHandler.post(() -> {
                    showNotification("创建目录：" + e.getMessage());
                });
            }
            if (response == null) {
                return;
            }
            List<Task> tasks = createTasks(response,
                    Shared.substringBeforeLast(url, "/") + "/", dir.getAbsolutePath());
            mHandler.post(() -> {
                showNotification("下载任务数量：" + tasks.size());
            });
            for (Task task : tasks) {
                DownloaderRequest downloaderRequest = new DownloaderRequest(task, this);
                mExecutor.submit(downloaderRequest);
            }
        }).start();
        return super.onStartCommand(intent, flags, startId);
    }

    public static class DownloaderRequest implements Runnable {
        private RequestListener mListener;
        private Task mTask;
        private String mMessage;

        public DownloaderRequest(Task task, RequestListener listener) {
            mTask = task;
            mListener = listener;
        }

        public String getMessage() {
            return mMessage;
        }

        @Override
        public void run() {
            Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND);
            File d = new File(mTask.directory, mTask.filename);
            mMessage = "待下载文件: " + d.getName();
            mListener.onProgress(this);
            if (d.exists()) {
                mMessage = "已下载文件: " + d.getName();
                mListener.onProgress(this);
                return;
            }
            File tmp = new File(mTask.directory, mTask.filename + ".tmp");
            if (tmp.exists()) {
                tmp.delete();
                mMessage = "删除临时文件: " + d.getName() + ".tmp";
                mListener.onProgress(this);
            }
            try {
                URL url = new URL(mTask.uri);
                HttpURLConnection c = (HttpURLConnection) url.openConnection();
                int status = c.getResponseCode();
                if (status < 200 || status >= 400) {
                    mMessage = "下载文件错误: " + d.getName() + ".tmp";
                    mListener.onProgress(this);
                    return;
                }
                long totalSize = c.getContentLengthLong();
                mMessage = "临时文件大小: " + d.getName() + ".tmp " + totalSize;
                mListener.onProgress(this);
                InputStream in = c.getInputStream();
                FileOutputStream out = new FileOutputStream(tmp);
                final byte[] buffer = new byte[8192];
                while (true) {
                    int len;
                    try {
                        len = in.read(buffer);
                    } catch (IOException e) {
                        mMessage = "下载文件错误: " + d.getName() + ".tmp";
                        mListener.onProgress(this);
                        return;
                    }
                    if (len == -1) {
                        break;
                    }
                    try {
                        out.write(buffer, 0, len);
                        //mVideoTask.DownloadedSize += len;
                        //updateProgress(fileName);
                    } catch (IOException e) {
                        mMessage = "下载文件错误: " + d.getName() + ".tmp";
                        mListener.onProgress(this);
                        return;
                    }
                }

            } catch (Exception exc) {
                mMessage = "下载文件错误: " + d.getName() + ".tmp";
                mListener.onProgress(this);
                return;
            }
            mMessage = "下载文件: " + d.getName();
            mListener.onProgress(this);
            tmp.renameTo(d);
        }
    }

}
