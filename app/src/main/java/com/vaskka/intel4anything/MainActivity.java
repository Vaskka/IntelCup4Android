package com.vaskka.intel4anything;

import androidx.appcompat.app.AppCompatActivity;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

import com.squareup.okhttp.Call;
import com.squareup.okhttp.Callback;
import com.squareup.okhttp.HttpUrl;
import com.squareup.okhttp.OkHttpClient;
import com.squareup.okhttp.Request;
import com.squareup.okhttp.Response;
import com.vaskka.intel4anything.utils.Constant;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.Timer;
import java.util.TimerTask;

public class MainActivity extends AppCompatActivity {

    TextView centerTextView;

    Timer timer;
    TimerTask task;

    OkHttpClient client;

    @SuppressLint("HandlerLeak")
    private Handler mainHandler = new Handler() {
         public void handleMessage(Message msg) {
             super.handleMessage(msg);
             try {
                 String ps = msg.getData().get("position").toString();
                 centerTextView.setText(ps);
             }
             catch (NullPointerException e) {
                 Log.e("json-format-error", e.getMessage());
             }

         }
     };

    /**
     * 请求并发信号给main thread
     */
    void doRequest() {

        HttpUrl.Builder urlBuilder = HttpUrl.parse(Constant.base_url).newBuilder();
        urlBuilder.addQueryParameter("id", Constant.id);
        String url = urlBuilder.build().toString();

        Request request = new Request.Builder()
                .url(url)
                .build();

        // do get
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Request request, IOException e) {
                e.printStackTrace();
            }

            @Override
            public void onResponse(Response response) throws IOException {
                if (!response.isSuccessful()) {

                    // 未找到id
                    Log.e("response", "Unexpected code:" + response.code());
                    throw new IOException("Unexpected code " + response);
                } else {

                    String bodyString = response.body().string();
                    // 合理id
                    Log.e("response", bodyString);

                    try {
                        JSONObject jsonObject = new JSONObject(bodyString);

                        Message message = new Message();
                        Bundle bundle = new Bundle();

                        bundle.putString("position", jsonObject.getString("position"));
                        message.setData(bundle);

                        // send signal to main thread
                        mainHandler.sendMessage(message);

                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            }
        });
    }


    /**
     * 初始化界面
     */
    private void initView() {
        View view = this.getLayoutInflater().inflate(R.layout.activity_main,null);
        setContentView(view);
        centerTextView = view.findViewById(R.id.position);

    }

    /**
     * 初始化数据
     */
    private void initData() {
        // init client
        client = new OkHttpClient();

        // schedule
        Timer timer = new Timer();
        TimerTask task = new TimerTask() {
            @Override
            public void run() {
                doRequest();
            }
        };

        // 3s 1次
        timer.schedule(task,0, Constant.timer_internal);
    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);


        initView();
        initData();
    }
}
