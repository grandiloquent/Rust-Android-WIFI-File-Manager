/*
 * Copyright (C) 2015 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package psycho.euphoria.killer;


import android.os.SystemClock;


/**
 * A read-only domain object representing a stopwatch.
 */
public final class Stopwatch {
    static final long UNUSED = Long.MIN_VALUE;
    /**
     * The single, immutable instance of a reset stopwatch.
     */
    private static final Stopwatch RESET_STOPWATCH = new Stopwatch(State.RESET, UNUSED, UNUSED, 0);
    /**
     * Elapsed time in ms this stopwatch has accumulated while running.
     */
    private final long mAccumulatedTime;
    /**
     * Elapsed time in ms the stopwatch was last started; {@link #UNUSED} if not running.
     */
    private final long mLastStartTime;
    /**
     * The time since epoch at which the stopwatch was last started.
     */
    private final long mLastStartWallClockTime;
    /**
     * Current state of this stopwatch.
     */
    private final State mState;

    Stopwatch(State state, long lastStartTime, long lastWallClockTime, long accumulatedTime) {
        mState = state;
        mLastStartTime = lastStartTime;
        mLastStartWallClockTime = lastWallClockTime;
        mAccumulatedTime = accumulatedTime;
    }

    /**
     * @return the amount of time accumulated up to the last time the stopwatch was started
     */
    public long getAccumulatedTime() {
        return mAccumulatedTime;
    }

    public long getLastStartTime() {
        return mLastStartTime;
    }

    public long getLastWallClockTime() {
        return mLastStartWallClockTime;
    }

    public State getState() {
        return mState;
    }

    /**
     * @return the total amount of time accumulated up to this moment
     */
    public long getTotalTime() {
        if (mState != State.RUNNING) {
            return mAccumulatedTime;
        }
        // In practice, "now" can be any value due to device reboots. When the real-time clock
        // is reset, there is no more guarantee that "now" falls after the last start time. To
        // ensure the stopwatch is monotonically increasing, normalize negative time segments to 0,
        final long timeSinceStart = now() - mLastStartTime;
        return mAccumulatedTime + Math.max(0, timeSinceStart);
    }

    public boolean isPaused() {
        return mState == State.PAUSED;
    }

    public boolean isReset() {
        return mState == State.RESET;
    }

    public boolean isRunning() {
        return mState == State.RUNNING;
    }

    public static long now() {
        return SystemClock.elapsedRealtime();
    }

    public static long wallClock() {
        return System.currentTimeMillis();
    }

    public enum State {RESET, RUNNING, PAUSED}

    /**
     * @return a copy of this stopwatch that is running
     */
    Stopwatch start() {
        if (mState == State.RUNNING) {
            return this;
        }
        return new Stopwatch(State.RUNNING, now(), wallClock(), getTotalTime());
    }

    /**
     * @return a copy of this stopwatch that is paused
     */
    Stopwatch pause() {
        if (mState != State.RUNNING) {
            return this;
        }
        return new Stopwatch(State.PAUSED, UNUSED, UNUSED, getTotalTime());
    }

    /**
     * @return a copy of this stopwatch that is reset
     */
    Stopwatch reset() {
        return RESET_STOPWATCH;
    }

    /**
     * @return this Stopwatch if it is not running or an updated version based on wallclock time.
     * The internals of the stopwatch are updated using the wallclock time which is durable
     * across reboots.
     */
    Stopwatch updateAfterReboot() {
        if (mState != State.RUNNING) {
            return this;
        }
        final long timeSinceBoot = now();
        final long wallClockTime = wallClock();
        // Avoid negative time deltas. They can happen in practice, but they can't be used. Simply
        // update the recorded times and proceed with no change in accumulated time.
        final long delta = Math.max(0, wallClockTime - mLastStartWallClockTime);
        return new Stopwatch(mState, timeSinceBoot, wallClockTime, mAccumulatedTime + delta);
    }

    /**
     * @return this Stopwatch if it is not running or an updated version based on the realtime.
     * The internals of the stopwatch are updated using the realtime clock which is accurate
     * across wallclock time adjustments.
     */
    Stopwatch updateAfterTimeSet() {
        if (mState != State.RUNNING) {
            return this;
        }
        final long timeSinceBoot = now();
        final long wallClockTime = wallClock();
        final long delta = timeSinceBoot - mLastStartTime;
        if (delta < 0) {
            // Avoid negative time deltas. They typically happen following reboots when TIME_SET is
            // broadcast before BOOT_COMPLETED. Simply ignore the time update and hope
            // updateAfterReboot() can successfully correct the data at a later time.
            return this;
        }
        return new Stopwatch(mState, timeSinceBoot, wallClockTime, mAccumulatedTime + delta);
    }
}