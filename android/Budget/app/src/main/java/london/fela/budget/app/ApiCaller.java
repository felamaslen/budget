package london.fela.budget.app;

import android.util.Log;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import london.fela.budget.helper.Data;

public class ApiCaller {
  private final List<Api> listeners = new ArrayList<>();

  private static String apiUrl;

  private static int getHttpMethod(String methodString) {
    if (methodString == "get") {
      return Request.Method.GET;
    }
    if (methodString == "post") {
      return Request.Method.POST;
    }
    if (methodString == "put") {
      return Request.Method.PUT;
    }
    if (methodString == "delete") {
      return Request.Method.DELETE;
    }
    if (methodString == "patch") {
      return Request.Method.PATCH;
    }
    
    throw new IllegalArgumentException("invalid request method");
  }

  public ApiCaller(String url) {
    apiUrl = url;
  }

  public void addListener(Api listener) {
    listeners.add(listener);
  }

  /**
   * makes a request to the REST Api
   *
   * @param tag_int_req    // tag used to identify the request to the implementation
   * @param tag_string_req // tag used to cancel the request
   * @param method         // GET, POST, PUT, DELETE and PATCH are implemented
   * @param args           // arguments to add to the URL
   */
  public void request(
    final int tag_int_req,
    String tag_string_req,
    String method,
    String args,
    final JSONObject data
  ) {
    final int httpMethod = ApiCaller.getHttpMethod(method.toLowerCase());

    final String url = apiUrl + args;

    JsonObjectRequest jsObjRequest = new JsonObjectRequest(
      httpMethod,
      url,
      data,
      new Response.Listener<JSONObject>() {
        @Override
        public void onResponse(JSONObject response) {
          for (Api listener : listeners) {
            listener.apiResponse(tag_int_req);

            listener.apiJSONSuccess(tag_int_req, response);
          }

          for (Api listener : listeners) {
            listener.apiResponseEnd(tag_int_req);
          }
        }
      },
      new Response.ErrorListener() {
        @Override
        public void onErrorResponse(VolleyError error) {
          Log.e(AppController.TAG, "API error: " + error.getMessage());
          Log.e(AppController.TAG, "details: " + data.toString());

          for (Api listener : listeners) {
            listener.apiError(tag_int_req, error);
          }
        }
      }
    ) {

      /**
       * add authorisation header for the REST Api
       *
       * @return headers
       * @throws AuthFailureError
       */
      @Override
      public Map<String, String> getHeaders() throws AuthFailureError {
        HashMap<String, String> reqHeaders = new HashMap<>();

        String apiKey = Data.user.get("apiKey");

        if (apiKey != null) {
          reqHeaders.put("Authorization", apiKey);
        }

        return reqHeaders;
      }
    };

    // add request to request queue
    AppController.getInstance().addToRequestQueue(jsObjRequest, tag_string_req);
  }
}
