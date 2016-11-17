package london.fela.budget.helper;

import java.util.HashMap;
import java.util.Map;

import london.fela.budget.app.YMD;

/**
 * holds cached data for a page
 */
public class PageCache {
  public int numItems = 0;

  // maps keys to ids (essentially an iterator)
  public final Map<Integer, Integer> id = new HashMap<>();

  // Each of the following maps an integer id to a value
  public final Map<Integer, YMD> date      = new HashMap<>();
  public final Map<Integer, String> item   = new HashMap<>();
  public final Map<Integer, Integer> cost  = new HashMap<>();

  public final Map<Integer, Map<String, String>> other = new HashMap<>();
}