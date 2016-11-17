package london.fela.budget.helper;

import android.app.Fragment;
import android.app.FragmentManager;
import android.support.v13.app.FragmentStatePagerAdapter;
import android.util.SparseArray;
import android.view.ViewGroup;

import london.fela.budget.R;
import london.fela.budget.app.AppConfig;
import london.fela.budget.fragment.FragmentBills;
import london.fela.budget.fragment.FragmentFood;
import london.fela.budget.fragment.FragmentFunds;
import london.fela.budget.fragment.FragmentGeneral;
import london.fela.budget.fragment.FragmentHoliday;
import london.fela.budget.fragment.FragmentIn;
import london.fela.budget.fragment.FragmentOverview;
import london.fela.budget.fragment.FragmentSocial;

/**
 * provides pagination between pages
 */
public class PagerAdapter extends FragmentStatePagerAdapter {
  private final SparseArray<Fragment> registeredFragments = new SparseArray<>();

  public PagerAdapter(FragmentManager fm) {
    super(fm);
  }

  public int getIcon(int index) {
    switch (index) {
      case 0:
        return R.mipmap.ic_tab_overview;
      case 1:
        return R.mipmap.ic_tab_funds;
      case 2:
        return R.mipmap.ic_tab_in;
      case 3:
        return R.mipmap.ic_tab_bills;
      case 4:
        return R.mipmap.ic_tab_food;
      case 5:
        return R.mipmap.ic_tab_general;
      case 6:
        return R.mipmap.ic_tab_holiday;
      case 7:
        return R.mipmap.ic_tab_social;
    }
    return 0;
  }

  @Override
  public Fragment getItem(int index) {
    switch (index) {
      case 0:
      default:
        return FragmentOverview.newInstance();
      case 1:
        return FragmentFunds.newInstance();
      case 2:
        return FragmentIn.newInstance();
      case 3:
        return FragmentBills.newInstance();
      case 4:
        return FragmentFood.newInstance();
      case 5:
        return FragmentGeneral.newInstance();
      case 6:
        return FragmentHoliday.newInstance();
      case 7:
        return FragmentSocial.newInstance();
    }
  }

  @Override
  public Object instantiateItem(ViewGroup container, int index) {
    Fragment fragment = (Fragment) super.instantiateItem(container, index);

    registeredFragments.put(index, fragment);
    return fragment;
  }

  @Override
  public void destroyItem(ViewGroup container, int index, Object object) {
    registeredFragments.remove(index);
    super.destroyItem(container, index, object);
  }

  public Fragment getRegisteredFragment(int index) {
    return registeredFragments.get(index);
  }

  @Override
  public int getCount() {
    return AppConfig.tabs.length;
  }

  @Override
  public int getItemPosition(Object object) {
    return POSITION_NONE;
  }

  @Override
  public CharSequence getPageTitle(int position) {
    //return AppConfig.tabs[position];
    return ""; // icons only :)
  }

}
