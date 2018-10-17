package london.fela.budget.activity;

import android.content.Intent;
import android.os.Bundle;
import android.app.ProgressDialog;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

import com.android.volley.VolleyError;

import org.json.JSONException;
import org.json.JSONObject;

import london.fela.budget.R;
import london.fela.budget.app.AppConfig;
import london.fela.budget.app.AppController;
import london.fela.budget.app.Api;
import london.fela.budget.app.ApiCaller;
import london.fela.budget.helper.SQLiteHandler;
import london.fela.budget.helper.SessionManager;

public class LoginActivity extends AppCompatActivity implements Api {
    private ProgressDialog pDialog;

    private EditText inputPin;
    private SessionManager session;
    private SQLiteHandler db;
    
    private final int API_TAG_LOGIN = 0;

    /** api stuff */
    @Override
    public void apiResponse(int tag) {
        switch (tag) {
            case API_TAG_LOGIN:
                AppController.hideDialog(pDialog);

                break;
        }
    }
    @Override
    public void apiJSONSuccess(int tag, JSONObject res) {
        if (tag == API_TAG_LOGIN) {
            session.setLogin(true);

            Integer uid;
            String name, apiKey;

            // store the user in sqlite
            try {
                uid = res.getInt("uid");
                name = res.getString("name");
                apiKey = res.getString("apiKey");

                // insert row into users table
                db.addUser(uid, name, apiKey);

                // launch main activity
                Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                startActivity(intent);
                finish();

            } catch (JSONException e) {
                Log.e("LOGIN", "Error processing login response: " + e.getMessage());
            }
        }
    }
    @Override
    public void apiError(int tag, VolleyError error) {
        switch (tag) {
            case API_TAG_LOGIN:
                AppController.alert(getApplicationContext(), "Wrong credentials");

                AppController.hideDialog(pDialog);

                break;
        }
    }
    @Override
    public void apiResponseEnd(int tag) {
    }

    private ApiCaller api;
    private void apiSetup() {
        api = new ApiCaller(AppConfig.apiUrl(getResources()));
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

        inputPin = findViewById(R.id.loginPin);
        btnLogin = findViewById(R.id.buttonLogin);

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
                if (pin.isEmpty()) {
                    AppController.alert(getApplicationContext(), "Please enter your PIN!");
                } else {
                    tryToLogin(pin);
                }
            }
        });
    }

    /**
     * verify login details with the server
     */
    private void tryToLogin(String pin) {
        pDialog.setMessage("Logging in...");
        AppController.showDialog(pDialog);

        JSONObject data = new JSONObject();
        try {
            data.put("pin", pin);

            api.request(
                    API_TAG_LOGIN,
                    "req_login",
                    "post",
                    AppConfig.URL_LOGIN,
                    data
            );
        } catch (JSONException e) {
            AppController.alert(getApplicationContext(), "Unknown error");

            Log.e("LOGIN", "Unhandled error logging in: " + e.getMessage());
        }
    }
}
