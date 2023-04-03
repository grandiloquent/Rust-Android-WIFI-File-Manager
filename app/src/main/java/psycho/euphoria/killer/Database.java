package psycho.euphoria.killer;

import android.content.SharedPreferences;

public class Database {
    public static void putConnectionString(SharedPreferences sharedPreferences,
                                           String host, String port, String dbName, String user, String password) {
        sharedPreferences.edit()
                .putString("v_host",host)
                .putString("v_port",port)
                .putString("v_db_name",dbName)
                .putString("v_user",user)
                .putString("v_password",password)
                .apply();
    }
}