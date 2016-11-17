package london.fela.budget.fragment;

import android.os.Parcel;
import android.os.Parcelable;

import java.util.HashMap;

public class EditParcel implements Parcelable {
  public HashMap<String, String> data = new HashMap<>();

  /*
  public int id;
  public int year;
  public int month;
  public int date;
  public String item;
  public int cost;
   */

  @Override
  public int describeContents() { return 0; }

  @Override
  public void writeToParcel(Parcel out, int flags) {
    out.writeInt(data.size());

    for (HashMap.Entry<String, String> entry : data.entrySet()) {
      out.writeString(entry.getKey());
      out.writeString(entry.getValue());
    }
  }

  public EditParcel(HashMap<String, String> tMap) {
    data = tMap;
  }

  private EditParcel(Parcel in) {
    int size = in.readInt();

    for (int i = 0; i < size; i++) {
      String key = in.readString();
      String value = in.readString();

      data.put(key, value);
    }
  }

  /*
  @Override
  public void writeToParcel(Parcel out, int flags) {
    out.writeInt(id);
    out.writeInt(year);
    out.writeInt(month);
    out.writeInt(date);
    out.writeString(item);
    out.writeInt(cost);
  }

  public EditParcel(
    int tId, int tYear, int tMonth, int tDate, String tItem, int tCost
  ) {

    id = tId;
    year = tYear;
    month = tMonth;
    date = tDate;
    item = tItem;
    cost = tCost;
  }
  
  private EditParcel(Parcel in) {
    id    = in.readInt();
    year = in.readInt();
    month = in.readInt();
    date = in.readInt();
    item = in.readString();
    cost = in.readInt();
  }
  */

  public static final Parcelable.Creator<EditParcel> CREATOR = new Parcelable.Creator<EditParcel>() {
    public EditParcel createFromParcel(Parcel in) {
      return new EditParcel(in);
    }

    public EditParcel[] newArray(int size) {
      return new EditParcel[size];
    }
  };
}