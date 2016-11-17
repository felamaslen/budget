package london.fela.budget.app;

import com.android.volley.VolleyError;

import org.json.JSONException;
import org.json.JSONObject;

@SuppressWarnings("UnusedParameters")
public interface Api {
  void apiResponse(int tag, String response);

  void apiJSONSuccess(int tag, JSONObject res);

  void apiJSONError(int tag, String errorMsg);

  void apiJSONException(int tag, JSONException e, String response);

  void apiError(int tag, VolleyError error);

  void apiResponseEnd(int tag, String response);
}

