package psycho.euphoria.killer;


import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Environment;
import android.os.IBinder;
import android.preference.PreferenceManager;

import java.io.File;

import psycho.euphoria.killer.service.Actions;
import psycho.euphoria.killer.service.Calculations;

import static psycho.euphoria.killer.service.Data.ACTION_DISMISS;

public class ServerService extends Service {


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
            int port = Calculations.getUsablePort(Utils.DEFAULT_PORT);
            mSharedPreferences.edit().putInt(Utils.KEY_PORT, port).apply();

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
        Actions.setServerService(this);
        mSharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);
        mLogFileName = new File(getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS),
                "service.txt").getAbsolutePath();
        Shared.log(mLogFileName, "onCreate");
        Actions.createNotificationChannel();
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
        Actions.createNotification();
        startServer();
        return START_STICKY;
    }


}