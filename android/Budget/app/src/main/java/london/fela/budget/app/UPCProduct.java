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
  private static final String TAG = UPCProduct.class.getSimpleName();
  private static final String apiUrl = "https://api.outpan.com/v2/products/";
  private static String apiKey;

  // api stuff
  private ApiCaller api;
  @Override public void apiResponse(int tag) {
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
  @Override public void apiError(int tag, VolleyError error) {
    productFetchFailed();
  }
  @Override public void apiResponseEnd(int tag) {
  }
  private void apiSetup() {
    api = new ApiCaller("");
    api.addListener(this);
  }

  private final int API_TAG_FETCH_PRODUCT = 1997;

  private final String GTIN;
  private final Context context;

  protected UPCProduct(String gtin, final Context appContext) {
    apiSetup();

    GTIN = gtin;
    context = appContext;
    apiKey = context.getResources().getString(R.string.outpan_api_key);
  }

  public void request() {
    AppController.startDialogMessage(AppConfig.DIALOG_MSG_LOADING_SCAN, "Loading product...");

    String requestUrl = apiUrl + GTIN + "?apikey=" + apiKey;

    api.request(API_TAG_FETCH_PRODUCT, "api_fetch_product", "get", requestUrl, null);
  }

  public void productFetched(JSONObject res) {
    // needs to be overridden
    Log.d(TAG, "[log] productFetched default method");
  }

  private void productFetchFailed() {
    Toast.makeText(context, "Error loading product!", Toast.LENGTH_LONG).show();
  }
}
