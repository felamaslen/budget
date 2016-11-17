package london.fela.budget.activity;

import android.content.Intent;
import android.os.Bundle;
import android.app.ProgressDialog;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

import com.android.volley.VolleyError;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

import london.fela.budget.R;
import london.fela.budget.app.AppConfig;
import london.fela.budget.app.AppController;
import london.fela.budget.app.Api;
import london.fela.budget.app.ApiCaller;
import london.fela.budget.helper.SQLiteHandler;
import london.fela.budget.helper.SessionManager;

public class LoginActivity extends AppCompatActivity implements Api {
  public static final String TAG = LoginActivity.class.getSimpleName();

  private ProgressDialog pDialog;

  private EditText inputPin;
  private SessionManager session;
  private SQLiteHandler db;
  
  private final int API_TAG_LOGIN = 0;

  /** api stuff */
  @Override
  public void apiResponse(int tag, String response) {
    switch (tag) {
      case API_TAG_LOGIN:
        AppController.hideDialog(pDialog);

        break;
    }
  }
  @Override
  public void apiJSONSuccess(int tag, JSONObject res) {
    switch (tag) {
      case API_TAG_LOGIN:
        // successfully fetched overview data
        // user successfully logged in
        // create login session
        session.setLogin(true);

        String uid, name, apiKey;

        // store the user in sqlite
        try {
          uid = res.getString("uid");
          name = res.getString("name");
          apiKey = res.getString("api_key");
        }
        catch (JSONException e) {
          return;
        }

        // insert row into users table
        db.addUser(uid, name, apiKey);

        // launch main activity
        Intent intent = new Intent(LoginActivity.this, MainActivity.class);
        startActivity(intent);
        finish();

        break;
    }
  }
  @Override
  public void apiJSONError(int tag, String msg) {
    AppController.alert(getApplicationContext(), "Error: " + msg);
  }
  @Override
  public void apiJSONException(int tag, JSONException e, String response) {
    AppController.alert(getApplicationContext(), "Bug: API error logging in");
  }
  @Override
  public void apiError(int tag, VolleyError error) {
    switch (tag) {
      case API_TAG_LOGIN:
        AppController.alert(getApplicationContext(), "Bug: API error logging in");

        AppController.hideDialog(pDialog);

        break;
    }
  }
  @Override
  public void apiResponseEnd(int tag, String response) {
  }

  private ApiCaller api;
  private void apiSetup() {
    api = new ApiCaller(AppConfig.api_url(getResources()));
    api.addListener(this);
  }
  
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_login);

    apiSetup();

    pDialog = new ProgressDialog(this);
    pDialog.setCancelable(false);

    Button btnLogin;

    inputPin = (EditText) findViewById(R.id.loginPin);
    btnLogin = (Button) findViewById(R.id.buttonLogin);

    // sqlite database handler
    db = new SQLiteHandler(getApplicationContext());

    // session manager
    session = new SessionManager(getApplicationContext());

    // check if user is already logged in or not
    if (session.isLoggedIn()) {
      // user is already logged in. Take him to main activity
      Intent intent = new Intent(LoginActivity.this, MainActivity.class);
      startActivity(intent);
      finish();
    }

    // login button click event
    btnLogin.setOnClickListener(new View.OnClickListener() {
      public void onClick(View view) {
        String pin = inputPin.getText().toString().trim();

        // check for empty data
        if (!pin.isEmpty()) {
          // login user
          checkLogin(pin);
        }
        else {
          // prompt user to enter credentials
          AppController.alert(getApplicationContext(), "Please enter your PIN!");
        }
      }
    });
  }

  /**
   * verify login details with the server
   */
  private void checkLogin(String pin) {
    pDialog.setMessage("Logging in...");
    AppController.showDialog(pDialog);

    Map<String, String> params = new HashMap<>();

    params.put("pin", pin);

    api.request(
      API_TAG_LOGIN,
      "req_login",
      "POST",
      AppConfig.URL_LOGIN,
      params
    );
  }
}
