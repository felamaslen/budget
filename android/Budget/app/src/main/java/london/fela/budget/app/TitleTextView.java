package london.fela.budget.app;

import android.content.Context;
import android.graphics.Typeface;
import android.util.AttributeSet;

/**
 * Title text view (custom font)
 */
public class TitleTextView extends android.support.v7.widget.AppCompatTextView {
    public TitleTextView(Context context, AttributeSet attrs) {
        super(context, attrs);

        this.setTypeface(Typeface.createFromAsset(context.getAssets(), "fonts/Bitter-Bold.ttf"));
    }
}
