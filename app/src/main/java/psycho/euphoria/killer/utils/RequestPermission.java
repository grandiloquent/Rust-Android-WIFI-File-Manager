package psycho.euphoria.killer.utils;

import java.util.List;

import psycho.euphoria.killer.MainActivity;

import static psycho.euphoria.killer.utils.FilterNeedPermissions.filterNeedPermissions;

public class RequestPermission {
    public static final int ITEM_ID_REFRESH = 1;
    public static boolean requestPermission(MainActivity context) {
    // RequestPermission.requestPermission(MainActivity.this);
        List<String> needPermissions = filterNeedPermissions(context);
        if (needPermissions.size() > 0) {
            context.requestPermissions(needPermissions.toArray(new String[0]), ITEM_ID_REFRESH);
            return true;
        }
        return false;
    }
}