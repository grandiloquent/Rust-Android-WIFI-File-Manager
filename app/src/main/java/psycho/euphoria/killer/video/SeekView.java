package psycho.euphoria.killer.video;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.util.AttributeSet;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;


public class SeekView extends View {

    private static final String TAG = "TAG/" + SeekView.class.getSimpleName();

    private final Paint mPaint = new Paint();
    private int mCount;
    private long mLast;
    private boolean mIsRunning;
    private int mHeight;
    private int mWidth;
    private Listener mListener;
    private boolean mInitial = false;

    public SeekView(Context context) {
        this(context, null);
    }

    public SeekView(Context context, AttributeSet attrs) {
        super(context, attrs);
        final Resources resources = context.getResources();
        mPaint.setAntiAlias(true);
        mPaint.setTextSize(48);
        mPaint.setColor(Color.WHITE);
    }

    public void setListener(Listener listener) {
        mListener = listener;
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        Log.e(TAG, String.format("onLayout:\nchanged = %s\nleft = %s\ntop = %s\nright = %s\nbottom = %s\n", changed, left, top, right, bottom));
        if (changed) {
            mInitial = true;
        }
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        int widthMode = MeasureSpec.getMode(widthMeasureSpec);
        int widthSize = MeasureSpec.getSize(widthMeasureSpec);
        int heightMode = MeasureSpec.getMode(heightMeasureSpec);
        int heightSize = MeasureSpec.getSize(heightMeasureSpec);
        mWidth = widthSize;
        mHeight = heightSize;
        setMeasuredDimension(mWidth, mHeight);
        //requestLayout();
        Log.e(TAG, String.format("onMeasure:\nwidthMode = %s\nwidthSize = %s\nheightMode = %s\nheightSize = %s\n", widthMode, widthSize, heightMode, heightSize));

    }

    @Override
    public void onDraw(Canvas canvas) {
        if (mInitial) {
            layout(0, 0, mWidth/2, mHeight);
        }
        if (mIsRunning) {
            canvas.drawText(mCount + " 秒", 48, mHeight / 5 , mPaint);
            long now = System.currentTimeMillis();
            if (mLast == 0) {
                mLast = now;
            }
            if (now - mLast > 100) {
                mCount++;
                mLast = now;
            }
            postInvalidateOnAnimation();
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                mIsRunning = true;
                break;
            case MotionEvent.ACTION_UP:
                mIsRunning = false;
                if (mListener != null) {
                    mListener.onStop(mCount);
                }
                mCount = 1;
                break;
        }
        return true;
    }

    public interface Listener {
        void onStop(int value);
    }


}