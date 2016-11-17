package london.fela.budget.app;

import android.app.Application;
import android.app.ProgressDialog;
import android.content.Context;
import android.text.TextUtils;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.Volley;

import java.util.LinkedHashMap;

import london.fela.budget.activity.MainActivity;

/**
 * Main app controller
 */
public class AppController extends Application {
  public static final String TAG = AppController.class.getSimpleName();

  private RequestQueue mRequestQueue;

  private static AppController mInstance;

  @Override
  public void onCreate() {
    super.onCreate();
    mInstance = this;
  }

  public static synchronized AppController getInstance() {
    return mInstance;
  }

  private RequestQueue getRequestQueue() {
    if (mRequestQueue == null) {
      mRequestQueue = Volley.newRequestQueue(getApplicationContext());
    }

    return mRequestQueue;
  }

  public <T> void addToRequestQueue(Request<T> req, String tag) {
    req.setTag(TextUtils.isEmpty(tag) ? TAG : tag);
    getRequestQueue().add(req);
  }

  @SuppressWarnings("unused")
  public void cancelPendingRequests(Object tag) {
    if (mRequestQueue != null) {
      mRequestQueue.cancelAll(tag);
    }
  }

  public static void alert(Context context, String msg) {
    Toast.makeText(
      context, msg, Toast.LENGTH_LONG
    ).show();
  }

  public static void showDialog(ProgressDialog dialog) {
    if (!dialog.isShowing()) {
      dialog.show();
    }
  }

  public static void hideDialog(ProgressDialog dialog) {
    if (dialog.isShowing()) {
      dialog.dismiss();
    }
  }

  private static final LinkedHashMap<Integer, String> dialogMessages = new LinkedHashMap<>();

  private static void showNextMessage() {
    LinkedHashMap.Entry<Integer, String> entry = dialogMessages.entrySet().iterator().next();

    String showMessage = entry.getValue();

    try {
      MainActivity.pDialog.setMessage(showMessage);

      showDialog(MainActivity.pDialog);
    }
    catch (Exception e) {
      e.printStackTrace();
    }
  }

  public static void startDialogMessage(int msgId, String msg) {
    dialogMessages.put(msgId, msg);

    showNextMessage();
  }

  public static void endDialogMessage(int msgId) {
    dialogMessages.remove(msgId);

    if (dialogMessages.size() > 0) {
      showNextMessage();
    }
    else {
      hideDialog(MainActivity.pDialog);
    }
  }
}
