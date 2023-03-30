package psycho.euphoria.killer.video;


import android.os.Handler;
import android.preference.PreferenceManager;
import android.widget.Toast;

public class LoopManager {
    PlayerActivity mPlayerActivity;
    Handler mHandler = new Handler();
    int mStart;
    int mOffset = 10 * 1000;
    boolean mIsStarted = false;

    public LoopManager(PlayerActivity activity) {
        mPlayerActivity = activity;
        mOffset = PreferenceManager.getDefaultSharedPreferences(activity)
                .getInt("loop_duration", 10) * 1000;
    }

    public boolean isStarted() {
        return mIsStarted;
    }

    public void startLoop(int start) {
        mHandler.removeCallbacks(null);
        if (mIsStarted) {
            mIsStarted = false;
            Toast.makeText(mPlayerActivity, "Loop ended", Toast.LENGTH_SHORT).show();
            return;
        }
        Toast.makeText(mPlayerActivity, "Loop started", Toast.LENGTH_SHORT).show();
        mIsStarted = true;
        mStart = start;
        mHandler.postDelayed(this::check, 500);
    }


    public void stopLoop() {
        mHandler.removeCallbacks(null);
    }

    private void check() {
        if (mPlayerActivity.getMediaPlayer() != null && mPlayerActivity.getMediaPlayer().getCurrentPosition() - mStart >= mOffset) {
            mPlayerActivity.getMediaPlayer().seekTo(mStart);
        }
        if (mIsStarted)
            mHandler.postDelayed(this::check, 500);
    }
}