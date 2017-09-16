package london.fela.budget.helper;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

/**
 * Handles application-specific databases
 */
public class SQLiteHandler extends SQLiteOpenHelper {
    // All Static variables
    // Database version
    private static final int DATABASE_VERSION = 1;

    // Database name
    private static final String DATABASE_NAME = "android_api";

    // Login table name
    private static final String TABLE_USER = "user";

    // Login table column names
    private static final String KEY_ID      = "uid";
    private static final String KEY_NAME    = "name";
    private static final String KEY_API_KEY = "apiKey";

    public SQLiteHandler(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    // Creating tables
    @Override
    public void onCreate(SQLiteDatabase db) {
        String CREATE_LOGIN_TABLE = "CREATE TABLE " + TABLE_USER + "("
            + KEY_ID + " INTEGER PRIMARY KEY,"
            + KEY_NAME + " TEXT,"
            + KEY_API_KEY + " TEXT"
            + ")";

        db.execSQL(CREATE_LOGIN_TABLE);
    }

    // Upgrading database
    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // Drop older table if existed
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_USER);

        // create tables again
        onCreate(db);
    }

    /**
     * Storing user details in database
     */
    public void addUser(String uid, String name, String apiKey) {
        SQLiteDatabase db = this.getWritableDatabase();

        ContentValues values = new ContentValues();

        values.put(KEY_ID, uid);
        values.put(KEY_NAME, name);
        values.put(KEY_API_KEY, apiKey);

        // inserting row
        db.insert(TABLE_USER, null, values);
        db.close();
    }

    /**
     * Getting user data from database
     */
    public void getUserDetails() {
        String selectQuery = "SELECT * FROM " + TABLE_USER;

        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.rawQuery(selectQuery, null);
        // move to first row
        cursor.moveToFirst();
        if (cursor.getCount() > 0) {
            Data.user.put("uid", cursor.getString(0));
            Data.user.put("name", cursor.getString(1));
            Data.user.put("apiKey", cursor.getString(2));
        }
        cursor.close();
        db.close();
    }

    /**
     * Re-create database: delete all tables and create them again
     */
    public void deleteUsers() {
        SQLiteDatabase db = this.getWritableDatabase();
        // delete all rows
        db.delete(TABLE_USER, null, null);
        db.close();
    }
}
