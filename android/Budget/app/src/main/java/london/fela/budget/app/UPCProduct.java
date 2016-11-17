package london.fela.budget.app;

import android.content.Context;
import android.util.Log;
import android.widget.Toast;

import com.android.volley.VolleyError;

import org.json.JSONException;
import org.json.JSONObject;

import london.fela.budget.R;

/**
 * returns a product by calling an API with a GSID
 */
public class UPCProduct implements Api {
  public static final String TAG = UPCProduct.class.getSimpleName();

  private static final String apiKey = "72642104076b3494d2703035e0d0bbd1";

  private static final String apiUrl = "https://api.outpan.com/v2/products/";

  // api stuff
  ApiCaller api;
  @Override public void apiResponse(int tag, String response) {
    switch (tag) {
      case API_TAG_FETCH_PRODUCT:
        AppController.endDialogMessage(AppConfig.DIALOG_MSG_LOADING_SCAN);

        break;
    }
  }
  @Override public void apiJSONSuccess(int tag, JSONObject res) {
    switch (tag) {
      case API_TAG_FETCH_PRODUCT:
        productFetched(res);

        break;
    }
  }
  @Override public void apiJSONError(int tag, String msg) {
  }
  @Override public void apiJSONException(int tag, JSONException e, String response) {
  }
  @Override public void apiError(int tag, VolleyError error) {
    productFetchFailed("Error loading product!");
  }
  @Override public void apiResponseEnd(int tag, String response) {
  }
  private void apiSetup() {
    api = new ApiCaller(context.getResources().getString(R.string.api_url));
    api.addListener(this);
  }

  private final int API_TAG_FETCH_PRODUCT = 1997;

  private String GTIN;

  private Context context;

  public UPCProduct(String gtin, final Context appContext) {
    apiSetup();

    GTIN = gtin;

    context = appContext;
  }

  public void request() {
    AppController.startDialogMessage(AppConfig.DIALOG_MSG_LOADING_SCAN, "Loading product...");

    String requestUrl = apiUrl + GTIN + "?apikey=" + apiKey;

    api.request(API_TAG_FETCH_PRODUCT, "api_fetch_product", "GET", requestUrl, null);
  }

  public void productFetched(JSONObject res) {
    // needs to be overridden
    Log.d(TAG, "[log] productFetched default method");
  }

  public void productFetchFailed(String message) {
    Toast.makeText(context, message, Toast.LENGTH_LONG).show();
  }
}
