package london.fela.budget.activity;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.widget.Toolbar;
import android.support.v4.view.ViewPager;
import android.support.design.widget.TabLayout;

import com.android.volley.VolleyError;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;

import london.fela.budget.R;
import london.fela.budget.app.Api;
import london.fela.budget.app.ApiCaller;
import london.fela.budget.app.AppConfig;
import london.fela.budget.app.AppController;
import london.fela.budget.app.YMD;
import london.fela.budget.helper.Data;
import london.fela.budget.fragment.FragmentList;
import london.fela.budget.fragment.FragmentOverview;
import london.fela.budget.helper.PageCache;
import london.fela.budget.helper.PagerAdapter;
import london.fela.budget.helper.SQLiteHandler;
import london.fela.budget.helper.SessionManager;

public class MainActivity extends Activity implements Api {
    private static final int API_TAG_FETCH_DATA = 87;

    // api stuff
    private ApiCaller api;
    @Override public void apiResponse(int tag) {
        switch (tag) {
            case API_TAG_FETCH_DATA:

                break;
        }
    }
    @Override public void apiJSONSuccess(int tag, JSONObject res) {
        switch (tag) {
            case API_TAG_FETCH_DATA:
                insertCache(res);

                break;
        }
    }
    @Override public void apiError(int tag, VolleyError error) {
        AppController.alert(getApplicationContext(), "Error :" + error.getMessage());

        logoutUser();
    }
    @Override public void apiResponseEnd(int tag) {
        switch (tag) {
            case API_TAG_FETCH_DATA:
                AppController.endDialogMessage(AppConfig.DIALOG_MSG_LOADING_ALL);
                break;
        }
    }
    private void apiSetup() {
        api = new ApiCaller(AppConfig.apiUrl(getResources()));
        api.addListener(this);
    }

    public static ProgressDialog pDialog;

    private SQLiteHandler db;
    private SessionManager session;
    public PagerAdapter pagerAdapter;

    private void translateCacheData(JSONObject data) {
        try {
            // insert overview data into cache
            JSONObject jOverview = data.getJSONObject("overview");
            JSONObject jOverviewCost = jOverview.getJSONObject("cost");
            Iterator<?> keys = jOverviewCost.keys();

            while (keys.hasNext()) {
                String category = (String) keys.next();

                JSONArray jValues = jOverviewCost.getJSONArray(category);
                try {
                    int[] values = new int[jValues.length()];
                    for (int i = 0; i < jValues.length(); i++) {
                        values[i] = jValues.getInt(i);
                    }
                    Data.Cache.Overview.cost.put(category, values);
                } catch (Exception e) {
                    // serious error
                    e.printStackTrace();
                }
            }

            JSONArray startYearMonth = jOverview.getJSONArray("startYearMonth");
            JSONArray endYearMonth = jOverview.getJSONArray("endYearMonth");

            Data.Cache.Overview.startYear = startYearMonth.getInt(0);
            Data.Cache.Overview.startMonth = startYearMonth.getInt(1);
            Data.Cache.Overview.endYear = endYearMonth.getInt(0);
            Data.Cache.Overview.endMonth = endYearMonth.getInt(1);
            Data.Cache.Overview.currentYear = jOverview.getInt("currentYear");
            Data.Cache.Overview.currentMonth = jOverview.getInt("currentMonth");

            // insert pages' data into cache
            for (String page : AppConfig.pages) {
                JSONArray pageJson = data.getJSONObject(page).getJSONArray("data");
                PageCache newPage = new PageCache();
                newPage.numItems = pageJson.length();

                for (int i = 0; i < pageJson.length(); i++) {
                    JSONObject item = pageJson.getJSONObject(i);

                    int id = item.getInt("I");

                    newPage.id.put(i, id);

                    if (item.has("d")) {
                        String jDate = item.getString("d");
                        YMD date = YMD.deserialise(jDate);
                        newPage.date.put(id, date);
                    }
                    if (item.has("i")) {
                        String name = item.getString("i");
                        newPage.item.put(id, name);
                    }
                    if (item.has("c")) {
                        int cost = item.getInt("c");
                        newPage.cost.put(id, cost);
                    }

                    HashMap<String, String> otherProps = Data.getOtherProps(page, item);
                    newPage.other.put(id, otherProps);
                }

                Data.Cache.Pages.put(page, newPage);
            }
        }
        catch (JSONException e) {
            // serious error
            e.printStackTrace();
        }
    }

    private void updateVisibleViewsData() {
        // load the data into the first view
        try {
            FragmentOverview overviewPage = (FragmentOverview)
                pagerAdapter.getRegisteredFragment(0);
            overviewPage.reloadDataFromCache();
        }
        catch (Exception e) {
            // the overview page isn't loaded (don't do anything)
        }

        // load data into any existing list views
        for (int p = 1; p < AppConfig.tabs.length; p++) {
            try {
                FragmentList page = (FragmentList) pagerAdapter.getRegisteredFragment(p);

                page.reloadDataFromCache();
            }
            catch (Exception e) {
                // page hasn't loaded yet (don't do anything)
            }
        }
    }

    private void insertCache(JSONObject res) {
        Data.dataPreLoaded = true;

        try {
            JSONObject data = res.getJSONObject("data");
            translateCacheData(data);
            updateVisibleViewsData();
        }
        catch (JSONException e) {
            AppController.alert(getApplicationContext(), "API bug: " + e.getMessage());
        }
    }

    private void loadCache() {
        AppController.startDialogMessage(AppConfig.DIALOG_MSG_LOADING_ALL, "Loading data...");

        api.request(
            API_TAG_FETCH_DATA,
            "req_data_all",
            "get",
            AppConfig.URL_DATA_ALL,
            null
        );
    }

    private void clearCache() {
        Data.Cache.Overview.cost = new HashMap<>();

        Data.Cache.Overview.startYear = 0;
        Data.Cache.Overview.startMonth = 0;
        Data.Cache.Overview.endYear = 0;
        Data.Cache.Overview.endMonth = 0;
        Data.Cache.Overview.currentYear = 0;
        Data.Cache.Overview.currentMonth = 0;

        Data.Cache.Pages = new HashMap<>();
        
        Data.dataPreLoaded = false;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        pDialog = new ProgressDialog(this);
        pDialog.setCancelable(false);

        Toolbar toolbar = findViewById(R.id.toolbar);

        this.setActionBar(toolbar);

        ViewPager pager = findViewById(R.id.pager);

        pagerAdapter = new PagerAdapter(getFragmentManager());
        pager.setAdapter(pagerAdapter);

        TabLayout tabLayout = findViewById(R.id.tab_layout);
        tabLayout.setTabMode(TabLayout.MODE_FIXED);
        tabLayout.setupWithViewPager(pager);

        for (int i = 0; i < AppConfig.tabs.length; i++) {
            TabLayout.Tab tab = tabLayout.getTabAt(i);

            if (tab != null) {
                tab.setIcon(pagerAdapter.getIcon(i));
            }
        }

        // sqlite database handler
        db = new SQLiteHandler(getApplicationContext());

        // session manager
        session = new SessionManager(getApplicationContext());

        if (!session.isLoggedIn()) {
            logoutUser();
        }

        // fetch user details from sqlite
        db.getUserDetails();

        apiSetup();

        if (!Data.dataPreLoaded) {
            loadCache();
        }
    }

    /**
     * handle menus
     */
    @Override
    public boolean onPrepareOptionsMenu(Menu menu) {
        MenuItem userInfo = menu.findItem(R.id.menu_user_status);

        String userText = "Logged in as " + Data.user.get("name");

        userInfo.setTitle(userText);

        return super.onPrepareOptionsMenu(menu);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.activity_main_actions, menu);

        //return super.onCreateOptionsMenu(menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.action_logout:
                logoutUser();
                break;
            case R.id.action_reload_cache:
                clearCache();
                loadCache();
                break;
        }
        return true;
    }

    /**
     * log out the user. Sets isLoggedIn flag to false in shared preferences, clears the user data
     * from sqlite users table
     */
    private void logoutUser() {
        session.setLogin(false);

        db.deleteUsers();

        clearCache();

        // launch the login activity
        Intent intent = new Intent(MainActivity.this, LoginActivity.class);
        startActivity(intent);
        finish();
    }
}
