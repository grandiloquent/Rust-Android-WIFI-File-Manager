package psycho.euphoria.killer.video;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.media.MediaCodec;
import android.media.MediaExtractor;
import android.media.MediaFormat;
import android.media.MediaMuxer;
import android.os.Bundle;
import android.os.Environment;
import android.preference.PreferenceManager;
import android.text.TextUtils;
import android.view.ContextMenu;
import android.view.ContextMenu.ContextMenuInfo;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView.AdapterContextMenuInfo;
import android.widget.GridView;
import android.widget.SearchView;
import android.widget.SearchView.OnQueryTextListener;
import android.widget.Toast;

import java.io.File;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import psycho.euphoria.killer.R;
import psycho.euphoria.killer.Shared;
import psycho.euphoria.killer.Shared.Listener;

public class VideoListActivity extends Activity {
    public static final String KEY_SORT = "sort";
    private VideoItemAdapter mVideoItemAdapter;
    private String mDirectory;
    private int mSort = 2;
    private String mFilter;

    @SuppressLint("WrongConstant")
    public static void extractAudio(String videoPath, String dstPath) {
        MediaMuxer mediaMuxer = null;
        MediaExtractor mediaExtractor = new MediaExtractor();
        try {
            mediaExtractor.setDataSource(videoPath);
            int audioTrackIdx = -1;
            for (int i = 0; i < mediaExtractor.getTrackCount(); i++) {
                MediaFormat mediaFormat = mediaExtractor.getTrackFormat(i);
                if (mediaFormat.getString(MediaFormat.KEY_MIME).startsWith("audio/")) {
                    mediaExtractor.selectTrack(i);
                    mediaMuxer = new MediaMuxer(dstPath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4);
                    audioTrackIdx = mediaMuxer.addTrack(mediaFormat);
                }
            }
            if (mediaMuxer == null) {
                return;
            }
            mediaMuxer.start();
            MediaCodec.BufferInfo bufferInfo = new MediaCodec.BufferInfo();
            ByteBuffer byteBuffer = ByteBuffer.allocate(500 * 1024);
            int readSize;
            while ((readSize = mediaExtractor.readSampleData(byteBuffer, 0)) > 0) {
                bufferInfo.offset = 0;
                bufferInfo.size = readSize;
                bufferInfo.flags = mediaExtractor.getSampleFlags();
                bufferInfo.presentationTimeUs = mediaExtractor.getSampleTime();
                mediaMuxer.writeSampleData(audioTrackIdx, byteBuffer, bufferInfo);
                mediaExtractor.advance();
            }
            mediaExtractor.release();
            mediaMuxer.stop();
            mediaMuxer.release();


        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void actionSortByCreateTimeAscending() {
        mSort = 2;
        sort();
    }

    private void actionSortByCreateTimeDescending() {
        mSort = 3;
        sort();
    }

    private void actionSortBySizeAscending() {
        mSort = 4;
        sort();
    }

    private void actionSortBySizeDescending() {
        mSort = 5;
        sort();
    }

    private String getDefaultPath() {
        File dir = new File(Environment.getExternalStorageDirectory(), ".others");
        if (!dir.exists()) {
            dir.mkdir();
        }
        return dir.getAbsolutePath();
    }

    private void initialize() {
        mDirectory = getDefaultPath();
        loadFolder(mFilter, mSort);
    }

    private void loadFolder(String filter, int sort) {
        File dir = new File(mDirectory);
        File[] videos = dir.listFiles(pathname -> pathname.isFile() && !pathname.getName().contains(".") && (TextUtils.isEmpty(filter) || pathname.getName().contains(filter)));
        if (videos == null) {
            return;
        }
        int direction = (sort & 1) == 0 ? -1 : 1;
        Arrays.sort(videos, (o1, o2) -> {
            if ((sort & 2) == 2) {
                final long result = o2.lastModified() - o1.lastModified();
                if (result < 0) {
                    return -1 * direction;
                }
                if (result > 0) {
                    return 1 * direction;
                }
            }
            if ((sort & 4) == 4) {
                final long result = o2.length() - o1.length();
                if (result < 0) {
                    return -1 * direction;
                }
                if (result > 0) {
                    return 1 * direction;
                }
            }
            return 0;
        });
        List<VideoItem> videoItems = new ArrayList<>();
        for (File video : videos) {
            // video.renameTo(new File(video.getParentFile(),Shared.substringBeforeLast(video.getName(),".")));
            VideoItem videoItem = new VideoItem();
            videoItem.path = video.getAbsolutePath();
            videoItems.add(videoItem);
        }
        mVideoItemAdapter.updateVideos(videoItems);
    }

    private void sort() {
        PreferenceManager
                .getDefaultSharedPreferences(this)
                .edit()
                .putInt(KEY_SORT, mSort)
                .apply();
        loadFolder(mFilter, mSort);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        initialize();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mSort = PreferenceManager.getDefaultSharedPreferences(this)
                .getInt(KEY_SORT, 3);
        setContentView(R.layout.video_list_activity);
        GridView gridView = findViewById(R.id.recycler_view);
        gridView.setNumColumns(2);
        registerForContextMenu(gridView);
        mVideoItemAdapter = new VideoItemAdapter(this);
        gridView.setAdapter(mVideoItemAdapter);
        gridView.setOnItemClickListener((parent, view, position, id) -> {
            File source = new File(
                    mVideoItemAdapter.getItem(position).path
            );
            PlayerActivity.launchActivity(view.getContext(), source.getAbsolutePath(), source.getName());
        });
        getActionBar().setDisplayHomeAsUpEnabled(true);
        initialize();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (mDirectory != null)
            loadFolder(mFilter, mSort);
    }

    @Override
    public boolean onContextItemSelected(MenuItem item) {
        AdapterContextMenuInfo contextMenuInfo = (AdapterContextMenuInfo) item.getMenuInfo();
        VideoItem videoItem = mVideoItemAdapter.getItem(contextMenuInfo.position);
        File dir = new File(mDirectory, item.getTitle().toString());
        new Thread(() -> {
            File f = new File(videoItem.path);
            File dst = new File(f.getParentFile(), Shared.substringBeforeLast(f.getName(), ".") + ".mp3");
            extractAudio(f.getAbsolutePath(), dst.getAbsolutePath());
            this.runOnUiThread(() -> {
                Toast.makeText(this, "音频完成", Toast.LENGTH_SHORT).show();
            });
        }).start();
        return super.onContextItemSelected(item);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.video_list, menu);
        SearchView searchView = (SearchView) menu.findItem(R.id.action_search).getActionView();
        searchView.setIconifiedByDefault(false);
        searchView.setOnQueryTextListener(new OnQueryTextListener() {
            @Override
            public boolean onQueryTextChange(String newText) {
                return false;
            }

            @Override
            public boolean onQueryTextSubmit(String query) {
                mFilter = query;
                loadFolder(mFilter, mSort);
                return true;
            }
        });
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public void onCreateContextMenu(ContextMenu menu, View v, ContextMenuInfo menuInfo) {
        menu.add(0, 0, 0, "提取音频");
        super.onCreateContextMenu(menu, v, menuInfo);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
        }
        if (item.getItemId() == R.id.action_sort_by_create_time_ascending) {
            actionSortByCreateTimeAscending();
        }
        if (item.getItemId() == R.id.action_sort_by_create_time_descending) {
            actionSortByCreateTimeDescending();
        }
        if (item.getItemId() == R.id.action_sort_by_size_ascending) {
            actionSortBySizeAscending();
        }
        if (item.getItemId() == R.id.action_sort_by_size_descending) {
            actionSortBySizeDescending();
        }
        if (item.getItemId() == R.id.action_loop_duration) {
            Shared.openTextContentDialog(this, "设置循环时间", new Listener() {
                @Override
                public void onSuccess(String value) {
                    PreferenceManager.getDefaultSharedPreferences(VideoListActivity.this)
                            .edit()
                            .putInt("loop_duration", Integer.parseInt(value.trim()))
                            .apply();
                }
            });
        }
        return super.onOptionsItemSelected(item);
    }
}
