package london.fela.budget.helper;

import android.util.SparseArray;
import android.util.SparseIntArray;

import java.util.Map;

import london.fela.budget.app.YMD;

/**
 * holds cached data for a page
 */
public class PageCache {
    public int numItems = 0;

    // maps keys to ids (essentially an iterator)
    public final SparseIntArray id = new SparseIntArray();

    // Each of the following maps an integer id to a value
    public final SparseArray<YMD> date    = new SparseArray<>();
    public final SparseArray<String> item = new SparseArray<>();
    public final SparseIntArray cost      = new SparseIntArray();

    public final SparseArray<Map<String, String>> other = new SparseArray<>();
}