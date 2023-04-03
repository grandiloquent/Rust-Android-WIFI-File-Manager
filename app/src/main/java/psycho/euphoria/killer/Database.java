package psycho.euphoria.killer;

import android.content.SharedPreferences;

public class Database {
    public static void putConnectionString(SharedPreferences sharedPreferences,
                                           String host, String port, String dbName, String user, String password) {
        sharedPreferences.edit()
                .putString("host", host)
                .putString("port", port)
                .putString("db_name", dbName)
                .putString("user", user)
                .putString("password", password)
                .apply();
    }
}