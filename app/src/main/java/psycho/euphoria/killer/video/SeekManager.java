package psycho.euphoria.killer.video;

import android.app.Activity;

import psycho.euphoria.killer.R;
import psycho.euphoria.killer.video.TimeBar.OnScrubListener;

public class SeekManager implements OnScrubListener {
    private final PlayerActivity mPlayerActivity;

    public SeekManager(PlayerActivity activity) {
        mPlayerActivity = activity;
        activity.getTimeBar().addListener(this);
    }

    @Override
    public void onScrubStart(TimeBar timeBar, long position) {
        mPlayerActivity.stopHideAction();
        mPlayerActivity.updateCurrentTime(position);
    }

    @Override
    public void onScrubMove(TimeBar timeBar, long position) {
        mPlayerActivity.updateCurrentTime(position);
    }

    @Override
    public void onScrubStop(TimeBar timeBar, long position, boolean canceled) {
        mPlayerActivity.getMediaPlayer().seekTo((int) position);
        mPlayerActivity.updateProgress();
        mPlayerActivity.scheduleHideControls();
    }
}