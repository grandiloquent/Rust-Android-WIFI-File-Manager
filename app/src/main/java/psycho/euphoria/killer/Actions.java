package psycho.euphoria.killer;

import android.content.Context;

import java.util.List;

public class Actions {
    private static Context sContext;
    public static final int ITEM_ID_REFRESH = 1;

    public static void setContext(Context context) {
        sContext = context;
    }

    public static boolean requestPermission() {
        List<String> needPermissions = Calculations.filterNeedPermissions(sContext);
        if (needPermissions.size() > 0) {
            requestPermissions(needPermissions.toArray(new String[0]), ITEM_ID_REFRESH);
            return true;
        }
        return false;
    }

}