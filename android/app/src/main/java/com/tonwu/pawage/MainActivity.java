package com.tonwu.pawage;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.core.content.IntentCompat;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONArray;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MyPawMainActivity";
    private final ExecutorService imageProcessingExecutor = Executors.newSingleThreadExecutor();
    private volatile int safeTopDp = 0;
    private volatile int safeBottomDp = 0;

    public class SafeAreaBridge {
        @JavascriptInterface
        public int getStatusBarHeightDp() {
            return safeTopDp;
        }

        @JavascriptInterface
        public int getNavigationBarHeightDp() {
            return safeBottomDp;
        }
    }

    private void applySafeAreaToWebView() {
        if (getBridge() != null && getBridge().getWebView() != null && (safeTopDp > 0 || safeBottomDp > 0)) {
            String js = String.format(
                "(function() {" +
                "  document.documentElement.style.setProperty('--safe-area-inset-top', '%dpx');" +
                "  document.documentElement.style.setProperty('--safe-area-inset-bottom', '%dpx');" +
                "})();",
                safeTopDp, safeBottomDp
            );
            getBridge().getWebView().post(() -> getBridge().getWebView().evaluateJavascript(js, null));
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().getSettings().setTextZoom(100);
            getBridge().getWebView().addJavascriptInterface(new SafeAreaBridge(), "AndroidSafeArea");
        }

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (view, windowInsets) -> {
            androidx.core.graphics.Insets insets = windowInsets.getInsets(
                WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.displayCutout()
            );
            androidx.core.graphics.Insets navInsets = windowInsets.getInsets(
                WindowInsetsCompat.Type.navigationBars()
            );
            float density = getResources().getDisplayMetrics().density;
            safeTopDp = Math.round(insets.top / density);
            safeBottomDp = Math.round(navInsets.bottom / density);
            applySafeAreaToWebView();
            return windowInsets;
        });

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

    @Override
    public void onResume() {
        super.onResume();
        applySafeAreaToWebView();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        imageProcessingExecutor.shutdown();
    }

    private boolean isValidImageUri(Uri uri) {
        if (uri == null) return false;
        String scheme = uri.getScheme();
        return "content".equalsIgnoreCase(scheme) || "file".equalsIgnoreCase(scheme);
    }

    private void handleSharedIntent(Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        String type = intent.getType();

        if (type != null && type.startsWith("image/")) {
            List<Uri> uris = new ArrayList<>();
            if (Intent.ACTION_SEND.equals(action)) {
                Uri uri = IntentCompat.getParcelableExtra(intent, Intent.EXTRA_STREAM, Uri.class);
                if (isValidImageUri(uri)) uris.add(uri);
            } else if (Intent.ACTION_SEND_MULTIPLE.equals(action)) {
                ArrayList<Uri> list = IntentCompat.getParcelableArrayListExtra(intent, Intent.EXTRA_STREAM, Uri.class);
                if (list != null) {
                    for (Uri u : list) {
                        if (isValidImageUri(u)) uris.add(u);
                    }
                }
            }

            if (!uris.isEmpty()) {
                processAndDeliverUris(uris);
            }
        }
    }

    private void processAndDeliverUris(List<Uri> uris) {
        imageProcessingExecutor.execute(() -> {
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
        });
    }
}
