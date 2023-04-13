package psycho.euphoria.killer.utils;

import android.content.Context;

import java.io.IOException;
import java.net.ServerSocket;

import psycho.euphoria.killer.MainActivity;

public class GetUsablePort {
    public static int getUsablePort(int start) {
        while (true) {
            try {
                ServerSocket serverPort = new ServerSocket(start);
                serverPort.close();
                return start;
            } catch (IOException ignored) {
                start++;
            }
        }
    }
}