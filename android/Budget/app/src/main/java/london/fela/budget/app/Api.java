package london.fela.budget.app;

import com.android.volley.VolleyError;

import org.json.JSONException;
import org.json.JSONObject;

@SuppressWarnings("UnusedParameters")
public interface Api {
  void apiResponse(int tag);

  void apiJSONSuccess(int tag, JSONObject res);

  void apiError(int tag, VolleyError error);

  void apiResponseEnd(int tag);
}

