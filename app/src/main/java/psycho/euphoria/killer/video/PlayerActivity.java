package psycho.euphoria.killer.video;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.SurfaceTexture;
import android.media.MediaPlayer;
import android.media.PlaybackParams;
import android.media.TimedMetaData;
import android.opengl.GLES20;
import android.os.Build.VERSION;
import android.os.Build.VERSION_CODES;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.GestureDetector;
import android.view.MotionEvent;
import android.view.Surface;
import android.view.TextureView;
import android.view.TextureView.SurfaceTextureListener;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.View.OnTouchListener;
import android.view.ViewConfiguration;
import android.widget.FrameLayout;
import android.widget.FrameLayout.LayoutParams;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.io.IOException;
import java.util.Formatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.microedition.khronos.egl.EGL10;
import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.egl.EGLContext;
import javax.microedition.khronos.egl.EGLDisplay;
import javax.microedition.khronos.egl.EGLSurface;

import psycho.euphoria.killer.R;
import psycho.euphoria.killer.Shared;
import psycho.euphoria.killer.video.TimeBar.OnScrubListener;

import static psycho.euphoria.killer.Shared.getStringForTime;
import static psycho.euphoria.killer.Shared.hideSystemUI;


public class PlayerActivity extends Activity implements OnTouchListener {

    public static final int DEFAULT_HIDE_TIME_DELAY = 5000;
    public static final String KEY_SHUFFLE = "shuffle";
    public static final String KEY_VIDEO_FILE = "VideoFile";
    public static final String KEY_VIDEO_TITLE = "VideoTitle";
    private static final int TOUCH_IGNORE = -1;
    private static final int TOUCH_NONE = 0;
    private final Handler mHandler = new Handler();
    private final StringBuilder mStringBuilder = new StringBuilder();
    private final Formatter mFormatter = new Formatter(mStringBuilder);
    private TextureView mTextureView;
    private MediaPlayer mMediaPlayer;
    private Surface mSurface;
    private FrameLayout mRoot;
    private boolean mLayout = false;
    private FrameLayout mBottomBar;
    private TextView mDuration;
    private SimpleTimeBar mTimeBar;
    private TextView mPosition;
    private LinearLayout mCenterControls;
    private ImageButton mPlayPause;
    private int mScaledTouchSlop;
    private int mDelta = 0;
    private int mCurrentPosition;
    private float mLastFocusX;
    private int mLastSystemUiVis;
    private PlayerSizeInformation mPlayerSizeInformation;
    private final Runnable mHideAction = this::hiddenControls;

    public MediaPlayer getMediaPlayer() {
        return mMediaPlayer;
    }

    public SimpleTimeBar getTimeBar() {
        return mTimeBar;
    }

    public static void launchActivity(Context context, String videoFile, String title) {
        Intent intent = new Intent(context, PlayerActivity.class);
        intent.putExtra(KEY_VIDEO_FILE, videoFile);
        intent.putExtra(KEY_VIDEO_TITLE, title);
        context.startActivity(intent);
    }

    public void scheduleHideControls() {
        mHandler.removeCallbacks(mHideAction);
        mHandler.postDelayed(mHideAction, DEFAULT_HIDE_TIME_DELAY);
    }

    public void stopHideAction() {
        mHandler.removeCallbacks(mHideAction);
    }

    public void updateCurrentTime(long position) {
        mPosition.setText(getStringForTime(mStringBuilder, mFormatter, position));
    }

    public void updateProgress() {
        if (mMediaPlayer == null || mBottomBar.getVisibility() != View.VISIBLE) {
            return;
        }
        mTimeBar.setPosition(mMediaPlayer.getCurrentPosition());
        mPosition.setText(getStringForTime(mStringBuilder, mFormatter, mMediaPlayer.getCurrentPosition()));
        mHandler.postDelayed(this::updateProgress, 1000);
    }

    static int calculateScreenOrientation(Activity activity) {
        int displayRotation = getDisplayRotation(activity);
        boolean standard = displayRotation < 180;
        if (activity.getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE) {
            if (standard)
                return ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE;
            else return ActivityInfo.SCREEN_ORIENTATION_REVERSE_LANDSCAPE;
        } else {
            if (displayRotation == 90 || displayRotation == 270) {
                standard = !standard;
            }
            return standard ? ActivityInfo.SCREEN_ORIENTATION_PORTRAIT : ActivityInfo.SCREEN_ORIENTATION_REVERSE_PORTRAIT;
        }
    }

    static int getDisplayRotation(Activity activity) {
        int rotation = activity.getWindowManager().getDefaultDisplay().getRotation();
        switch (rotation) {
            case Surface.ROTATION_0:
                return 0;
            case Surface.ROTATION_90:
                return 90;
            case Surface.ROTATION_180:
                return 180;
            case Surface.ROTATION_270:
                return 270;
        }
        return 0;
    }

    private void bindingFullScreenEvent() {
        findViewById(R.id.action_fullscreen)
                .setOnClickListener(v -> fullScreen());

    }

    private void clearSurface() {
        if (mSurface == null) {
            return;
        }
        EGL10 egl = (EGL10) EGLContext.getEGL();
        EGLDisplay display = egl.eglGetDisplay(EGL10.EGL_DEFAULT_DISPLAY);
        egl.eglInitialize(display, null);
        int[] attribList = {
                EGL10.EGL_RED_SIZE, 8,
                EGL10.EGL_GREEN_SIZE, 8,
                EGL10.EGL_BLUE_SIZE, 8,
                EGL10.EGL_ALPHA_SIZE, 8,
                EGL10.EGL_RENDERABLE_TYPE, EGL10.EGL_WINDOW_BIT,
                EGL10.EGL_NONE, 0,      // placeholder for recordable [@-3]
                EGL10.EGL_NONE
        };
        EGLConfig[] configs = new EGLConfig[1];
        int[] numConfigs = new int[1];
        egl.eglChooseConfig(display, attribList, configs, configs.length, numConfigs);
        EGLConfig config = configs[0];
        EGLContext context = egl.eglCreateContext(display, config, EGL10.EGL_NO_CONTEXT, new int[]{
                12440, 2, EGL10.EGL_NONE
        });
        EGLSurface eglSurface = egl.eglCreateWindowSurface(display, config, mSurface, new int[]{
                EGL10.EGL_NONE
        });
        egl.eglMakeCurrent(display, eglSurface, eglSurface, context);
        GLES20.glClearColor(0, 0, 0, 1);
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT);
        egl.eglSwapBuffers(display, eglSurface);
        egl.eglDestroySurface(display, eglSurface);
        egl.eglMakeCurrent(display, EGL10.EGL_NO_SURFACE, EGL10.EGL_NO_SURFACE, EGL10.EGL_NO_CONTEXT);
        egl.eglDestroyContext(display, context);
        egl.eglTerminate(display);
    }

    private void fullScreen() {
        int orientation = calculateScreenOrientation(this);
        if (orientation == ActivityInfo.SCREEN_ORIENTATION_PORTRAIT) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
            int videoWidth = mMediaPlayer.getVideoWidth();
            int videoHeight = mMediaPlayer.getVideoHeight();
            double ratio = mRoot.getMeasuredWidth() / (videoHeight * 1.0);
            int width = (int) (ratio * videoWidth);
            int left = (mRoot.getMeasuredHeight() - width) >> 1;
            FrameLayout.LayoutParams layoutParams = new LayoutParams(width, getResources().getDisplayMetrics().widthPixels);
            layoutParams.leftMargin = left;
            mTextureView.setLayoutParams(layoutParams);
        } else {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
            int videoWidth = mMediaPlayer.getVideoWidth();
            int videoHeight = mMediaPlayer.getVideoHeight();
            double ratio = mRoot.getMeasuredHeight() / (videoWidth * 1.0);
            int height = (int) (ratio * videoHeight);
            int top = (mRoot.getMeasuredWidth() - height) >> 1;
            FrameLayout.LayoutParams layoutParams = new LayoutParams(mRoot.getMeasuredHeight(), height);
            layoutParams.topMargin = top;
            mTextureView.setLayoutParams(layoutParams);
        }
    }

    private void hiddenControls() {
        mTimeBar.setVisibility(View.GONE);
        mBottomBar.setVisibility(View.GONE);
        mCenterControls.setVisibility(View.GONE);
        hideSystemUI(this);
        zoomIn();
    }

    private void initializePlayer() {
        mMediaPlayer = new MediaPlayer();
        try {
            mMediaPlayer.setOnBufferingUpdateListener(this::onBufferingUpdate);
            mMediaPlayer.setOnCompletionListener(this::onCompletion);
            mMediaPlayer.setOnErrorListener(this::onError);
            mMediaPlayer.setOnInfoListener(this::onInfo);
            mMediaPlayer.setOnPreparedListener(this::onPrepared);
            mMediaPlayer.setOnSeekCompleteListener(this::onSeekComplete);
            mMediaPlayer.setOnTimedMetaDataAvailableListener(this::onTimedMetaDataAvailable);
            mMediaPlayer.setOnVideoSizeChangedListener(this::onVideoSizeChanged);
            mMediaPlayer.setSurface(mSurface);
            play();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void onBufferingUpdate(MediaPlayer mediaPlayer, int i) {
        mTimeBar.setBufferedPosition(i);
    }

    private void onCompletion(MediaPlayer mediaPlayer) {
        mMediaPlayer.reset();
        try {
            play();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private boolean onError(MediaPlayer mediaPlayer, int i, int i1) {
        return true;
    }

    private boolean onInfo(MediaPlayer mediaPlayer, int i, int i1) {
        return true;
    }

    private void onPlayPause(View view) {
        if (mMediaPlayer.isPlaying()) {
            mMediaPlayer.pause();
            mPlayPause.setBackgroundDrawable(getResources().getDrawable(R.drawable.exo_ic_play_circle_filled));
        } else {
            mMediaPlayer.start();
            mPlayPause.setBackgroundDrawable(getResources().getDrawable(R.drawable.exo_ic_pause_circle_filled));
        }
    }

    private void onPrepared(MediaPlayer mediaPlayer) {
        mDuration.setText(getStringForTime(mStringBuilder, mFormatter, mediaPlayer.getDuration()));
        mTimeBar.setDuration(mediaPlayer.getDuration());
        mMediaPlayer.start();
//        PlaybackParams playbackParams = new PlaybackParams();
//        playbackParams.setSpeed(mSpeed);
//        mMediaPlayer.setPlaybackParams(playbackParams);
        mPlayPause.setBackgroundDrawable(getResources().getDrawable(R.drawable.exo_ic_pause_circle_filled));
        updateProgress();
        hiddenControls();

    }

    private void onSeekComplete(MediaPlayer mediaPlayer) {
    }

    private void onTimedMetaDataAvailable(MediaPlayer mediaPlayer, TimedMetaData timedMetaData) {
    }

    private void onVideoSizeChanged(MediaPlayer mediaPlayer, int videoWidth, int videoHeight) {
        zoomIn();
    }

    private void play() throws IOException {
        mMediaPlayer.setDataSource(getIntent().getStringExtra(KEY_VIDEO_FILE));
        mMediaPlayer.prepareAsync();
    }

    private void setOnSystemUiVisibilityChangeListener() {
        // When the user touches the screen or uses some hard key, the framework
        // will change system ui visibility from invisible to visible. We show
        // the media control and enable system UI (e.g. ActionBar) to be visible at this point
        getWindow().getDecorView().setOnSystemUiVisibilityChangeListener(
                new View.OnSystemUiVisibilityChangeListener() {

                    @Override
                    public void onSystemUiVisibilityChange(int visibility) {
                        int diff = mLastSystemUiVis ^ visibility;
                        mLastSystemUiVis = visibility;
                        if ((diff & View.SYSTEM_UI_FLAG_HIDE_NAVIGATION) != 0
                                && (visibility & View.SYSTEM_UI_FLAG_HIDE_NAVIGATION) == 0) {
                            showControls();
                            getActionBar().show();
                            scheduleHideControls();
                            zoomOut();
                        }
                    }
                });
    }

    private void showControls() {
        mTimeBar.setVisibility(View.VISIBLE);
        mBottomBar.setVisibility(View.VISIBLE);
        mCenterControls.setVisibility(View.VISIBLE);
        updateProgress();
    }

    private void zoomIn() {
        if (mMediaPlayer == null) {
            return;
        }
        if (mPlayerSizeInformation == null) {
            mPlayerSizeInformation = new PlayerSizeInformation(this, mRoot, mBottomBar, mTimeBar);
        }
        int orientation = getResources().getConfiguration().orientation;
        if (orientation == 1) {
            int videoHeight = mMediaPlayer.getVideoHeight();
            int videoWidth = mMediaPlayer.getVideoWidth();
            double ratio = mRoot.getMeasuredWidth() / (videoWidth * 1.0);
            int height = (int) (ratio * videoHeight);
            int top = (mRoot.getMeasuredHeight() - height) >> 1;
            FrameLayout.LayoutParams layoutParams = new LayoutParams(mRoot.getMeasuredWidth(), height);
            layoutParams.topMargin = top;
            mTextureView.setLayoutParams(layoutParams);
        } else {
            int videoHeight = mMediaPlayer.getVideoHeight();
            int videoWidth = mMediaPlayer.getVideoWidth();
            float x = ((float) mPlayerSizeInformation.getAvailableHeight()) / videoWidth;
            float y = ((float) mPlayerSizeInformation.getAvailableWidth()) / videoHeight;
            x = Math.min(x, y);
            int screenWidth = (int) (videoWidth * x);
            int screenHeight = (int) (videoHeight * x);
            FrameLayout.LayoutParams layoutParams = new LayoutParams(screenWidth, screenHeight);
            layoutParams.topMargin = (mPlayerSizeInformation.getAvailableWidth() - screenHeight) >> 1;
            layoutParams.leftMargin = (mPlayerSizeInformation.getAvailableHeight() - screenWidth) >> 1;
            mTextureView.setLayoutParams(layoutParams);
        }

    }

    private void zoomOut() {
        if (mMediaPlayer == null) {
            return;
        }
        if (mPlayerSizeInformation == null) {
            mPlayerSizeInformation = new PlayerSizeInformation(this, mRoot, mBottomBar, mTimeBar);
        }
        int orientation = getResources().getConfiguration().orientation;
        if (orientation == 1) {
            mPlayerSizeInformation = new PlayerSizeInformation(this, mRoot, mBottomBar, mTimeBar);
            int videoHeight = mMediaPlayer.getVideoHeight();
            int videoWidth = mMediaPlayer.getVideoWidth();
            float x = ((float) mPlayerSizeInformation.getAvailableWidth()) / videoWidth;
            float y = ((float) mPlayerSizeInformation.getPortraitHeight()) / videoHeight;
            x = Math.min(x, y);
            int screenWidth = (int) (videoWidth * x);
            int screenHeight = (int) (videoHeight * x);
            FrameLayout.LayoutParams layoutParams = new LayoutParams(screenWidth, screenHeight);
            layoutParams.topMargin = (mPlayerSizeInformation.getPortraitHeight() - screenHeight) >> 1;
            layoutParams.leftMargin = (mPlayerSizeInformation.getAvailableWidth() - screenWidth) >> 1;
            mTextureView.setLayoutParams(layoutParams);
        } else {
            int videoHeight = mMediaPlayer.getVideoHeight();
            int videoWidth = mMediaPlayer.getVideoWidth();
            float x = ((float) mPlayerSizeInformation.getAvailableHeight()) / videoWidth;
            float y = ((float) mPlayerSizeInformation.getLandscapeHeight()) / videoHeight;
            x = Math.min(x, y);
            int screenWidth = (int) (videoWidth * x);
            int screenHeight = (int) (videoHeight * x);
            FrameLayout.LayoutParams layoutParams = new LayoutParams(screenWidth, screenHeight);
            layoutParams.topMargin = (mPlayerSizeInformation.getLandscapeHeight() - screenHeight) >> 1;
            layoutParams.leftMargin = (mPlayerSizeInformation.getAvailableHeight() - screenWidth - mPlayerSizeInformation.getNavigationBarLanscapeHeight()) >> 1;
            mTextureView.setLayoutParams(layoutParams);
            //Log.e("B5aOx2", String.format("zoomOut, %s", mPlayerSizeInformation.toString()));
        }


    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.player_activity);
        AndroidUtilities.setApplicationHandler(mHandler);
        bindingFullScreenEvent();
        mRoot = findViewById(R.id.root);
        AndroidUtilities.density = getResources().getDisplayMetrics().density;
        //        mRoot.setOnClickListener(v -> {
//            showSystemUi(true);
//            showControls();
//            scheduleHideControls();
//
//        });
        setOnSystemUiVisibilityChangeListener();
        hideSystemUI(this);
//        View decorView = getWindow().getDecorView();
//        decorView.setOnSystemUiVisibilityChangeListener
//                (visibility -> {
//                    // Note that system bars will only be "visible" if none of the
//                    // LOW_PROFILE, HIDE_NAVIGATION, or FULLSCREEN flags are set.
//                    if ((visibility & View.SYSTEM_UI_FLAG_FULLSCREEN) == 0) {
//                        // TODO: The system bars are visible. Make any desired
//                        // adjustments to your UI, such as showing the action bar or
//                        // other navigational controls.
//                        mHandler.postDelayed(this::hideSystemUI, DEFAULT_HIDE_TIME_DELAY);
//                    } else {
//                        // TODO: The system bars are NOT visible. Make any desired
//                        // adjustments to your UI, such as hiding the action bar or
//                        // other navigational controls.
//                    }
//                });
        mCenterControls = findViewById(R.id.exo_center_controls);
        mTextureView = findViewById(R.id.texture_view);
        mPosition = findViewById(R.id.position);
        mBottomBar = findViewById(R.id.exo_bottom_bar);
        mDuration = findViewById(R.id.duration);
        mTextureView.setSurfaceTextureListener(new SurfaceTextureListener() {
            @Override
            public void onSurfaceTextureAvailable(SurfaceTexture surface, int width, int height) {
                mSurface = new Surface(surface);
                initializePlayer();
            }

            @Override
            public boolean onSurfaceTextureDestroyed(SurfaceTexture surface) {
                return false;
            }

            @Override
            public void onSurfaceTextureSizeChanged(SurfaceTexture surface, int width, int height) {
            }

            @Override
            public void onSurfaceTextureUpdated(SurfaceTexture surface) {
            }
        });
        mTimeBar = findViewById(R.id.timebar);
        new SeekManager(this);
        mPlayPause = findViewById(R.id.play_pause);
        mPlayPause.setOnClickListener(this::onPlayPause);
        mScaledTouchSlop = ViewConfiguration.get(this).getScaledTouchSlop();
        //mTextureView.setOnTouchListener(this);
        LoopManager loopManager = new LoopManager(this);
        findViewById(R.id.action_file_download).setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View view) {
                PlaybackParams playbackParams = mMediaPlayer.getPlaybackParams();
                float speed = playbackParams.getSpeed() * 2;
                if (speed > 4) speed = 1;
                playbackParams.setSpeed(speed);
                mMediaPlayer.setPlaybackParams(playbackParams);
            }
        });
        findViewById(R.id.action_shuffle).setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View view) {
                if (loopManager.isStarted()) {
                    loopManager.startLoop(0);
                } else {
                    Shared.openTextContentDialog(PlayerActivity.this, "跳转", value -> {
                        loopManager.startLoop(Utils.parseMilliseconds(value));
                    });
                }
            }
        });
        if (getIntent().getStringExtra(KEY_VIDEO_TITLE) != null)
            this.setTitle(getIntent().getStringExtra(KEY_VIDEO_TITLE));
        findViewById(R.id.action_speed).setOnClickListener(v -> Shared.openTextContentDialog(PlayerActivity.this, "跳转", value -> {
            mMediaPlayer.seekTo(Utils.parseMilliseconds(value), MediaPlayer.SEEK_CLOSEST);
        }));
    }

    @Override
    protected void onStart() {
        super.onStart();
        if (mSurface != null)
            initializePlayer();
    }

    @Override
    protected void onStop() {
        super.onStop();
        mHandler.removeCallbacks(null);
        if (mMediaPlayer != null) {
            mMediaPlayer.stop();
            mMediaPlayer.release();
            mMediaPlayer = null;
        }
        clearSurface();
    }

    @Override
    public boolean onTouch(View v, MotionEvent event) {
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN: {
                mLastFocusX = event.getX();
                showControls();
                mMediaPlayer.pause();
                mCurrentPosition = mMediaPlayer.getCurrentPosition();
                mDelta = 0;
                break;
            }
            case MotionEvent.ACTION_MOVE: {
                final float scrollX = mLastFocusX - event.getX();
                if (Math.abs(scrollX) > 1) {
                    if (scrollX < 0) {
                        mDelta++;
                    } else {
                        mDelta--;
                    }
                }
                mPosition.setText(getStringForTime(mStringBuilder, mFormatter, mCurrentPosition + mDelta * 1000));
                mLastFocusX = event.getX();
                break;
            }
            case MotionEvent.ACTION_UP: {
                mMediaPlayer.seekTo(mCurrentPosition + mDelta * 1000);
                mMediaPlayer.start();
                scheduleHideControls();
            }
        }
        return true;
    }

    private class GestureListener extends GestureDetector.SimpleOnGestureListener {
        private int mScaledTouchSlop;
        private int mCurrentTime;

        public GestureListener() {
            mScaledTouchSlop = ViewConfiguration.get(PlayerActivity.this).getScaledTouchSlop();
        }

        @Override
        public boolean onDoubleTap(MotionEvent e) {
            return true;
        }

        @Override
        public boolean onDown(MotionEvent event) {
            // don't return false here or else none of the other
            // gestures will work
            mCurrentTime = mMediaPlayer.getCurrentPosition();
            return true;
        }

        @Override
        public boolean onFling(MotionEvent e1, MotionEvent e2, float velocityX, float velocityY) {
            return true;
        }

        @Override
        public void onLongPress(MotionEvent e) {
        }

        @Override
        public boolean onScroll(MotionEvent e1, MotionEvent e2, float distanceX, float distanceY) {
            try {
                float diffY = e2.getY() - e1.getY();
                float diffX = e2.getX() - e1.getX();
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    // && Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD
                    if (Math.abs(diffX) > mScaledTouchSlop) {
                        if (diffX > 0) {
                            mMediaPlayer.seekTo(mMediaPlayer.getCurrentPosition() + 1);
                        } else {
                        }
                    }
                }
//                else {
//                    if (Math.abs(diffY) > SWIPE_THRESHOLD && Math.abs(velocityY) > SWIPE_VELOCITY_THRESHOLD) {
//                        if (diffY > 0) {
//                        } else {
//                        }
//                    }
//                }
            } catch (Exception exception) {
                exception.printStackTrace();
            }
            return true;
        }

        @Override
        public boolean onSingleTapConfirmed(MotionEvent e) {
            showControls();
            scheduleHideControls();
            return true;
        }
    }

}
