package london.fela.budget.app;

import android.util.Log;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import london.fela.budget.helper.Data;

public class ApiCaller {
  private final List<Api> listeners = new ArrayList<>();

  private static String api_url;

  public ApiCaller(String api_url) {
    this.api_url = api_url + "/rest.php?t=";
  }

  public void addListener(Api listener) {
    listeners.add(listener);
  }

  /**
   * does a request to the REST Api
   *
   * @param tag_int_req    // tag used to identify the request to the implementation
   * @param tag_string_req // tag used to cancel the request
   * @param req_type       // GET or POST
   * @param url            // which url to request
   */
  public void request(
    final int tag_int_req,
    String tag_string_req,
    String req_type,
    String url,
    final Map<String, String> params
  ) {
    final int httpMethod;

    if (req_type.equals("POST")) {
      httpMethod = Request.Method.POST;
    } else {
      httpMethod = Request.Method.GET;
    }

    url = this.api_url + url;

    StringRequest strReq = new StringRequest(
      httpMethod,
      url,
      new Response.Listener<String>() {
        @Override
        public void onResponse(String response) {
          for (Api listener : listeners) {
            listener.apiResponse(tag_int_req, response);
          }

          try {
            JSONObject res = new JSONObject(response);

            boolean error;
            try {
              error = res.getBoolean("error");
            }
            catch (JSONException e) {
              error = false;
            }

            // check for error node in json
            if (!error) {
              for (Api listener : listeners) {
                listener.apiJSONSuccess(tag_int_req, res);
              }
            } else {
              // error with request, get the error message
              String errorMsg = res.getString("errorText");
              for (Api listener : listeners) {
                listener.apiJSONError(tag_int_req, errorMsg);
              }
            }
          } catch (JSONException e) {
            e.printStackTrace();

            for (Api listener : listeners) {
              listener.apiJSONException(tag_int_req, e, response);
            }
          }

          for (Api listener : listeners) {
            listener.apiResponseEnd(tag_int_req, response);
          }
        }
      },
      new Response.ErrorListener() {
        @Override
        public void onErrorResponse(VolleyError error) {
          Log.e(AppController.TAG, "API error: " + error.getMessage());

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

      /**
       * add custom parameters
       *
       * @return params
       */
      @Override
      protected Map<String, String> getParams() {
        Map<String, String> reqParams = new HashMap<>();

        if (params != null) {
          reqParams.putAll(params);
        }

        return reqParams;
      }
    };

    // add request to request queue
    AppController.getInstance().addToRequestQueue(strReq, tag_string_req);
  }
}