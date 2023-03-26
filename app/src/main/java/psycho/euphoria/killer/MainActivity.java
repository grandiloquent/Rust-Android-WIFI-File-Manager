package psycho.euphoria.killer;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;

import psycho.euphoria.killer.lib.RustLog;

public class MainActivity extends Activity {
    static {
        System.loadLibrary("rust_lib");
    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        Log.e("B5aOx2", String.format("onCreate, %s", ""));
         RustLog.initialiseLogging();
    }

}