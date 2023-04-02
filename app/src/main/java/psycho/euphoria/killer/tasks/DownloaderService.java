package psycho.euphoria.killer.tasks;

import android.app.Notification.Builder;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Environment;
import android.os.Handler;
import android.os.IBinder;
import android.os.Process;
import android.util.Log;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.channels.FileChannel;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.text.DecimalFormat;
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
    private ExecutorService mExecutor = Executors.newFixedThreadPool(1);
    private List<DownloaderRequest> mRequests = new ArrayList<>();

    public static String formatFileSize(long fileS, Integer numDigits) {
        if (numDigits == null) {
            numDigits = 1;
        }
        DecimalFormat df;
        switch (numDigits) {
            case 0:
                df = new DecimalFormat("#");
                break;
            case 2:
                df = new DecimalFormat("#.##");
                break;
            case 3:
                df = new DecimalFormat("#.###");
                break;
            default:
                df = new DecimalFormat("#.#");
                break;
        }
        String fileSizeString = "";
        if (fileS < FileSizeUnitEnum.sizeOfUnit("B")) {
            fileSizeString = df.format((double) fileS) + "B";
        } else if (fileS < FileSizeUnitEnum.sizeOfUnit("KB")) {
            fileSizeString = df.format((double) fileS / FileSizeUnitEnum.sizeOfUnit("B")) + "B";
        } else if (fileS < FileSizeUnitEnum.sizeOfUnit("MB")) {
            fileSizeString = df.format((double) fileS / FileSizeUnitEnum.sizeOfUnit("KB")) + "KB";
        } else if (fileS < FileSizeUnitEnum.sizeOfUnit("GB")) {
            fileSizeString = df.format((double) fileS / FileSizeUnitEnum.sizeOfUnit("MB")) + "MB";
        } else if (fileS < FileSizeUnitEnum.sizeOfUnit("TB")) {
            fileSizeString = df.format((double) fileS / FileSizeUnitEnum.sizeOfUnit("GB")) + "GB";
        } else if (fileS < FileSizeUnitEnum.sizeOfUnit("PB")) {
            fileSizeString = df.format((double) fileS / FileSizeUnitEnum.sizeOfUnit("TB")) + "TB";
        } else if (fileS < FileSizeUnitEnum.sizeOfUnit("EB")) {
            fileSizeString = df.format((double) fileS / FileSizeUnitEnum.sizeOfUnit("PB")) + "PB";
        } else if (fileS < FileSizeUnitEnum.sizeOfUnit("ZB")) {
            fileSizeString = df.format((double) fileS / FileSizeUnitEnum.sizeOfUnit("EB")) + "EB";
        } else if (fileS < FileSizeUnitEnum.sizeOfUnit("YB")) {
            fileSizeString = df.format((double) fileS / FileSizeUnitEnum.sizeOfUnit("ZB")) + "ZB";
        } else {
            fileSizeString = df.format((double) fileS / FileSizeUnitEnum.sizeOfUnit("YB")) + "YB";
        }
        return fileSizeString;
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

    private void launchDownloadThread(String url, File dir) {
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
            List<Task> tasks = createTasks(response, Shared.substringBeforeLast(url, "/") + "/", dir.getAbsolutePath());
            mHandler.post(() -> {
                showNotification("下载任务数量：" + tasks.size());
            });
//            try (FileChannel fc = new FileOutputStream(new File(
//                    dir.getAbsolutePath(),
//                    "1.mp4"
//            )).getChannel()) {
//                for (Task task : tasks) {
//                    try (FileChannel fci = new FileInputStream(
//                            new File(task.directory, task.filename)
//                    ).getChannel()) {
//                        fci.transferTo(0, fci.size(), fc);
//                    }
//                }
//                fc.force(true);
//            } catch (Exception e) {
//            }
            for (Task task : tasks) {
                DownloaderRequest downloaderRequest = new DownloaderRequest(task, this);
                downloaderRequest.run();
                //mExecutor.submit(downloaderRequest);
            }
        }).start();
    }

    private void showNotification(String title) {
        Builder builder;
        builder = new Builder(this, DOWNLOAD_VIDEO);
        builder.setSmallIcon(android.R.drawable.stat_sys_download).setContentTitle(title);
        mNotificationManager.notify(1, builder.build());
    }

    private void tryMergingVideos() {
        try {
            Files.list(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS).toPath()).filter(Files::isDirectory).forEach(x -> {
                try (FileChannel fc = new FileOutputStream(new File(
                        x.toFile().getParentFile(),
                        x.getFileName() + ".mp4"
                )).getChannel()) {
                    File[] files = x.toFile().listFiles(File::isFile);
                    for (File f : files) {
                        if(!f.getName().trim().endsWith(".ts")) continue;
                        try (FileChannel fci = new FileInputStream(
                                f
                        ).getChannel()) {
                            fci.transferTo(0, fci.size(), fc);
                        }
                    }
                    fc.force(true);
                } catch (Exception e) {
                    Log.e("B5aOx2", String.format("tryMergingVideos, %s", e.getMessage()));
                }
            });
        } catch (IOException e) {
            Log.e("B5aOx2", String.format("tryMergingVideos, %s", e.getMessage()));

        }
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
    public void onProgress(DownloaderRequest downloaderRequest) {
        mHandler.post(() -> showNotification(downloaderRequest.getMessage()));
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            if (intent.getAction() != null && intent.getAction().equals("stop")) {
                mNotificationManager.cancel(1);
                stopForeground(true);
                stopSelf(startId);
                android.os.Process.killProcess(android.os.Process.myPid());
                return START_NOT_STICKY;
            }
            if (intent.getAction() != null && intent.getAction().equals("merge")) {
                tryMergingVideos();
                return START_NOT_STICKY;
            }
            String url = intent.getStringExtra(EXTRA_VIDEO_ADDRESS);
            String title = intent.getStringExtra(EXTRA_VIDEO_TITLE);
            if (url != null && title != null) {
                File dir = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), title);
                if (!dir.isDirectory()) {
                    dir.mkdir();
                }
                try {
                    Files.write(new File(dir, "log.txt").toPath(), url.getBytes(StandardCharsets.UTF_8));
                } catch (IOException e) {
                    e.printStackTrace();
                }
                showNotification("创建目录：" + dir);
                launchDownloadThread(url, dir);
            } else {
                try {
                    Files.list(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS).toPath()).filter(Files::isDirectory).forEach(x -> {
                        try {
                            launchDownloadThread(
                                    new String(Files.readAllBytes(new File(x.toFile(), "log.txt").toPath()), StandardCharsets.UTF_8)
                                    , x.toFile());
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    });
                } catch (IOException e) {
                }

            }
        }
        return super.onStartCommand(intent, flags, startId);
    }

    public enum FileSizeUnitEnum {
        /**
         * 1B (byte 字节)；
         * 1KB(Kilobyte 千字节) = 2^10 B = 1024 B；
         * 1MB(Megabyte 兆字节) = 2^10 KB = 1024 KB = 2^20 B；
         * 1GB(Gigabyte 吉字节) = 2^10 MB = 1024 MB = 2^30 B；
         * 1TB(Trillionbyte 太字节) = 2^10 GB = 1024 GB = 2^40 B；
         * 1PB(Petabyte 拍字节) = 2^10 TB = 1024 TB = 2^50 B；
         * 1EB(Exabyte 艾字节) = 2^10 PB = 1024 PB = 2^60 B；
         * 1ZB(Zettabyte 泽(Z)字节) = 2^10 EB = 1024 EB = 2^70 B；
         * 1YB(YottaByte 尧(Y)字节) = 2^10 ZB = 1024 ZB = 2^80 B；
         * 1BB(Brontobyte ) = 2^10 YB = 1024 YB = 2^90 B；
         * 1NB(NonaByte ) = 2^10 BB = 1024 BB = 2^100 B；
         * 1DB(DoggaByte) = 2^10 NB = 1024 NB = 2^110 B；
         */
        B(1, "B", "字节"), KB(1 << 10, "KB", "千字节"), MB(1 << 20, "MB", "兆字节"), GB(1 << 30, "GB", "吉字节"), TB((long) Math.pow(2.0, 40.0), "TB", "太字节"), PB((long) Math.pow(2.0, 50.0), "PB", "拍字节"), EB((long) Math.pow(2.0, 60.0), "EB", "艾字节"), ZB((long) Math.pow(2.0, 70.0), "ZB", "Z字节"), YB((long) Math.pow(2.0, 80.0), "YB", "Y字节");

        private long size = 0L;
        private String unit;
        private String unitCh;

        FileSizeUnitEnum(long size, String unit, String unitCh) {
            this.size = size;
            this.unit = unit;
            this.unitCh = unitCh;
        }

        public static FileSizeUnitEnum sizeOf(long size) {
            FileSizeUnitEnum[] fileSizeUnits = FileSizeUnitEnum.values();
            for (FileSizeUnitEnum fileSizeUnit : fileSizeUnits) {
                if (fileSizeUnit.size == size) {
                    return fileSizeUnit;
                }
            }
            return null;
        }

        public static long sizeOfUnit(String unit) {
            FileSizeUnitEnum[] fileSizeUnits = FileSizeUnitEnum.values();
            for (FileSizeUnitEnum fileSizeUnit : fileSizeUnits) {
                if (fileSizeUnit.unit.equals(unit)) {
                    return fileSizeUnit.size;
                }
            }
            return -1L;
        }

        public static FileSizeUnitEnum unitChOf(String unitCh) {
            FileSizeUnitEnum[] fileSizeUnits = FileSizeUnitEnum.values();
            for (FileSizeUnitEnum fileSizeUnit : fileSizeUnits) {
                if (fileSizeUnit.unitCh.equals(unitCh)) {
                    return fileSizeUnit;
                }
            }
            return null;
        }

        public static FileSizeUnitEnum unitOf(String unit) {
            FileSizeUnitEnum[] fileSizeUnits = FileSizeUnitEnum.values();
            for (FileSizeUnitEnum fileSizeUnit : fileSizeUnits) {
                if (fileSizeUnit.unit.equals(unit)) {
                    return fileSizeUnit;
                }
            }
            return null;
        }


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
            File d = new File(mTask.directory, String.format("%03d_%s", mTask.sequence, mTask.filename));
            mListener.onProgress(this);
            if (d.exists()) {
                mListener.onProgress(this);
                return;
            }
            mMessage = "待下载文件: " + d.getName();
            File tmp = new File(mTask.directory, mTask.filename + ".tmp");
            try {
                URL url = new URL(mTask.uri);
                HttpURLConnection c = (HttpURLConnection) url.openConnection();
                c.setConnectTimeout(10000);
                c.setReadTimeout(10000);
                if (tmp.exists()) {
                    c.setRequestProperty("Range", "bytes=" + tmp.length() + "-");
                }
                int status = c.getResponseCode();
                if (status < 200 || status >= 400) {
                    mMessage = "下载文件错误: " + d.getName() + " 响应码 " + status;
                    mListener.onProgress(this);
                    return;
                }
                long totalSize = c.getContentLengthLong();
                if (totalSize == 0) {
                    return;
                }
                String t = formatFileSize(totalSize, 1);
                mMessage = d.getName() + " " + t;
                mListener.onProgress(this);
                InputStream in = c.getInputStream();
                RandomAccessFile out = new RandomAccessFile(tmp, "rw");
                final byte[] buffer = new byte[8192];
                long totalBytes = 0;
                if (tmp.exists()) {
                    totalBytes += tmp.length();
                }
                if (tmp.exists()) {
                    out.seek(tmp.length());
                }
                while (true) {
                    int len;
                    try {
                        len = in.read(buffer);
                    } catch (IOException e) {
                        mMessage = String.format("错误: %s %s", d.getName(), e.getMessage());
                        mListener.onProgress(this);
                        return;
                    }
                    if (len == -1) {
                        break;
                    }
                    try {
                        out.write(buffer, 0, len);
                        totalBytes += len;
                        mMessage = String.format("下载: %s %s/%s", d.getName(), formatFileSize(totalBytes, 1), t);
                        mListener.onProgress(this);
                    } catch (IOException e) {
                        mMessage = String.format("错误: %s %s", d.getName(), e.getMessage());
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
