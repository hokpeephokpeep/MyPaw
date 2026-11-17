package com.tonwu.pawage;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MyPawMainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().getSettings().setTextZoom(100);
        }

        handleSharedIntent(getIntent());

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    WebView webView = getBridge().getWebView();
                    webView.evaluateJavascript(
                        "(function() { return window.__handleAndroidBack ? window.__handleAndroidBack() : 'unhandled'; })()",
                        value -> {
                            if ("\"exit\"".equals(value)) {
                                runOnUiThread(() -> finish());
                            } else if ("\"unhandled\"".equals(value)) {
                                runOnUiThread(() -> {
                                    if (webView.canGoBack()) {
                                        webView.goBack();
                                    } else {
                                        finish();
                                    }
                                });
                            }
                        }
                    );
                } else {
                    finish();
                }
            }
        });
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleSharedIntent(intent);
    }

    private void handleSharedIntent(Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        String type = intent.getType();

        if (type != null && type.startsWith("image/")) {
            List<Uri> uris = new ArrayList<>();
            if (Intent.ACTION_SEND.equals(action)) {
                Uri uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
                if (uri != null) uris.add(uri);
            } else if (Intent.ACTION_SEND_MULTIPLE.equals(action)) {
                ArrayList<Uri> list = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
                if (list != null) uris.addAll(list);
            }

            if (!uris.isEmpty()) {
                processAndDeliverUris(uris);
            }
        }
    }

    private void processAndDeliverUris(List<Uri> uris) {
        new Thread(() -> {
            try {
                JSONArray jsonArray = new JSONArray();
                for (Uri uri : uris) {
                    try (InputStream is = getContentResolver().openInputStream(uri)) {
                        if (is != null) {
                            BitmapFactory.Options opts = new BitmapFactory.Options();
                            opts.inJustDecodeBounds = true;
                            BitmapFactory.decodeStream(is, null, opts);

                            int maxDim = Math.max(opts.outWidth, opts.outHeight);
                            int inSampleSize = 1;
                            while (maxDim / inSampleSize > 1920) {
                                inSampleSize *= 2;
                            }

                            opts.inJustDecodeBounds = false;
                            opts.inSampleSize = inSampleSize;

                            try (InputStream is2 = getContentResolver().openInputStream(uri)) {
                                if (is2 != null) {
                                    Bitmap bitmap = BitmapFactory.decodeStream(is2, null, opts);
                                    if (bitmap != null) {
                                        ByteArrayOutputStream baos = new ByteArrayOutputStream();
                                        bitmap.compress(Bitmap.CompressFormat.JPEG, 90, baos);
                                        byte[] bytes = baos.toByteArray();
                                        String base64 = "data:image/jpeg;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP);
                                        jsonArray.put(base64);
                                        bitmap.recycle();
                                    }
                                }
                            }
                        }
                    } catch (Exception ex) {
                        Log.e(TAG, "Failed to read uri: " + uri, ex);
                    }
                }

                if (jsonArray.length() > 0) {
                    runOnUiThread(() -> {
                        if (getBridge() != null && getBridge().getWebView() != null) {
                            WebView webView = getBridge().getWebView();
                            String script = "if (window.__handleIncomingSharedPhotos) {" +
                                "  window.__handleIncomingSharedPhotos(" + jsonArray.toString() + ");" +
                                "} else {" +
                                "  window.__pendingSharedPhotos = " + jsonArray.toString() + ";" +
                                "}";
                            webView.evaluateJavascript(script, null);
                        }
                    });
                }
            } catch (Exception e) {
                Log.e(TAG, "Error in processAndDeliverUris", e);
            }
        }).start();
    }
}
