package psycho.euphoria.killer.utils;

import android.content.Intent;
import android.net.Uri;
import android.os.Build.VERSION;
import android.os.Build.VERSION_CODES;
import android.os.Environment;
import android.provider.Settings;

import psycho.euphoria.killer.MainActivity;

public class RequestStorageManagerPermission {
    public static void requestStorageManagerPermission(MainActivity context) {
        // RequestStorageManagerPermission.requestStorageManagerPermission(MainActivity.this);
        if (VERSION.SDK_INT >= VERSION_CODES.R) {
            // 测试是否已获取所有文件访问权限 Manifest.permission.MANAGE_EXTERNAL_STORAGE
            // 该权限允许程序访问储存中的大部分文件
            // 但不包括 Android/data 目录下程序的私有数据目录
            if (!Environment.isExternalStorageManager()) {
                try {
                    Uri uri = Uri.parse("package:psycho.euphoria.killer" );
                    Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, uri);
                    context.startActivity(intent);
                } catch (Exception ex) {
                    Intent intent = new Intent();
                    intent.setAction(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION);
                    context.startActivity(intent);
                }
            }
        }
    }
}