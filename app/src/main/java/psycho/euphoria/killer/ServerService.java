package psycho.euphoria.killer;


import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Environment;
import android.os.IBinder;
import android.preference.PreferenceManager;
import android.util.Log;

import java.io.File;


import static psycho.euphoria.killer.utils.CreateNotification.createNotification;
import static psycho.euphoria.killer.utils.CreateNotificationChannel.createNotificationChannel;
import static psycho.euphoria.killer.utils.GetPendingIntentDismiss.ACTION_DISMISS;
import static psycho.euphoria.killer.utils.GetUsablePort.getUsablePort;

public class ServerService extends Service {


    public static final int DEFAULT_PORT = 3000;
    public static final String KEY_PORT = "port";
    SharedPreferences mSharedPreferences;
    private String mLogFileName;

    public String getString(String key) {
        return mSharedPreferences.getString(key, "");
    }

    public void setString(String key, String value) {
        mSharedPreferences.edit().putString(key, value).apply();
    }

    private void startServer() {
        new Thread(() -> {
            int port = getUsablePort(DEFAULT_PORT);
            mSharedPreferences.edit().putInt(KEY_PORT, port).apply();
            MainActivity.startServer(ServerService.this, ServerService.this.getAssets(), Shared.getDeviceIP(ServerService.this), port);
        }).start();
    }

    @Override
    public IBinder onBind(Intent intent) {
        Shared.log(mLogFileName, "onBind");
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        mSharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);
        mLogFileName = new File(getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS),
                "service.txt").getAbsolutePath();
        Shared.log(mLogFileName, "onCreate");
        createNotificationChannel(this);
    }

    @Override
    public void onDestroy() {
        Shared.log(mLogFileName, "onDestroy");
        super.onDestroy();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Shared.log(mLogFileName, "onStartCommand",
                intent == null ? "intent is null" : intent.getAction());
        if (intent != null) {
            String action = intent.getAction();
            if (action != null && action.equals(ACTION_DISMISS)) {
                stopForeground(true);
                stopSelf();
                return START_NOT_STICKY;
            }
        }
        // https://developer.android.com/guide/components/foreground-services
        createNotification(this);
        Log.e("B5aOx2", String.format("onStartCommand, %s", "startServer"));
        startServer();
        sendBroadcast(new Intent(getPackageName() + ".server_started"));
        return START_STICKY;
    }


}