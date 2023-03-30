package psycho.euphoria.killer;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.text.TextPaint;
import android.util.AttributeSet;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;

import psycho.euphoria.killer.Stopwatch.State;
import psycho.euphoria.killer.video.Utils;

public class SeekView extends View {

    private final RectF mArcRect = new RectF();
    /**
     * The color indicating the completed portion of the lap.
     */
    private final int mCompletedColor;
    /**
     * The size of the dot indicating the user's position within the reference lap.
     */
    private final float mDotRadius;
    private final Paint mFill = new Paint();
    /**
     * The size of the stroke that paints the marker for the end of the prior lap.
     */
    private final float mMarkerStrokeSize;
    private final Paint mPaint = new Paint();
    /**
     * An amount to subtract from the true radius to account for drawing thicknesses.
     */
    private final float mRadiusOffset;
    /**
     * The color indicating the remaining portion of the current lap.
     */
    private final int mRemainderColor;
    /**
     * Used to scale the width of the marker to make it similarly visible on all screens.
     */
    private final float mScreenDensity;
    /**
     * The size of the stroke that paints the lap circle.
     */
    private final float mStrokeSize;

    public SeekView(Context context) {
        this(context, null);
    }

    public SeekView(Context context, AttributeSet attrs) {
        super(context, attrs);
        final Resources resources = context.getResources();
        final float dotDiameter = resources.getDimension(R.dimen.circletimer_dot_size);
        mDotRadius = dotDiameter / 2f;
        mScreenDensity = resources.getDisplayMetrics().density;
        mStrokeSize = resources.getDimension(R.dimen.circletimer_circle_size);
        mMarkerStrokeSize = resources.getDimension(R.dimen.circletimer_marker_size);
        mRadiusOffset = calculateRadiusOffset(mStrokeSize, dotDiameter, mMarkerStrokeSize);
        mRemainderColor = Color.BLACK;
        mCompletedColor = Color.WHITE;
        mPaint.setAntiAlias(true);
        mPaint.setStyle(Paint.Style.STROKE);
        mFill.setAntiAlias(true);
        mFill.setColor(mCompletedColor);
        mFill.setStyle(Paint.Style.FILL);
    }

    public static float calculateRadiusOffset(
            float strokeSize, float dotStrokeSize, float markerStrokeSize) {
        return Math.max(strokeSize, Math.max(dotStrokeSize, markerStrokeSize));
    }

    @Override
    public void onDraw(Canvas canvas) {
        // Compute the size and location of the circle to be drawn.
        final int xCenter = getWidth() / 2;
        final int yCenter = getHeight() / 2;
        final float radius = Math.min(xCenter, yCenter) - mRadiusOffset;
        // Reset old painting state.
        mPaint.setColor(mRemainderColor);
        mPaint.setStrokeWidth(mStrokeSize);
        canvas.drawCircle(xCenter, yCenter, radius, mPaint);
        // The first lap is the reference lap to which all future laps are compared.
//        final Stopwatch stopwatch = new Stopwatch(State.RUNNING, 1, 1, 1);
//        final int lapCount = laps.size();
//        final Lap firstLap = laps.get(lapCount - 1);
//        final Lap priorLap = laps.get(0);
//        final long firstLapTime = firstLap.getLapTime();
//        final long currentLapTime = stopwatch.getTotalTime() - priorLap.getAccumulatedTime();
//        // Draw a combination of red and white arcs to create a circle.
        mArcRect.top = yCenter - radius;
        mArcRect.bottom = yCenter + radius;
        mArcRect.left = xCenter - radius;
        mArcRect.right = xCenter + radius;
        final float redPercent = 0.3f;
        final float whitePercent = 1 - (redPercent > 1 ? 1 : redPercent);
//        // Draw a white arc to indicate the amount of reference lap that remains.
        canvas.drawArc(mArcRect, 270 + (1 - whitePercent) * 360, whitePercent * 360, false, mPaint);
//        // Draw a red arc to indicate the amount of reference lap completed.
        mPaint.setColor(mCompletedColor);
        canvas.drawArc(mArcRect, 270, redPercent * 360, false, mPaint);
//        // Starting on lap 2, a marker can be drawn indicating where the prior lap ended.
//        if (lapCount > 1) {
        mPaint.setColor(Color.RED);
        mPaint.setStrokeWidth(mMarkerStrokeSize);
        final float markerAngle = .9f;
        final float startAngle = 270 + markerAngle;
        final float sweepAngle = mScreenDensity * (float) (360 / (radius * Math.PI));
        canvas.drawArc(mArcRect, startAngle, sweepAngle, false, mPaint);
//        }
//        // Draw a red dot to indicate current position relative to reference lap.
        final float dotAngleDegrees = 270 + redPercent * 360;
        final double dotAngleRadians = Math.toRadians(dotAngleDegrees);
        final float dotX = xCenter + (float) (radius * Math.cos(dotAngleRadians));
        final float dotY = yCenter + (float) (radius * Math.sin(dotAngleRadians));
        canvas.drawCircle(dotX, dotY, mDotRadius, mFill);
//        // If the stopwatch is not running it does not require continuous updates.
//        if (stopwatch.isRunning()) {
//            postInvalidateOnAnimation();
//        }
    }

    /**
     * Start the animation if it is not currently running.
     */
    void update() {
        postInvalidateOnAnimation();
    }

}