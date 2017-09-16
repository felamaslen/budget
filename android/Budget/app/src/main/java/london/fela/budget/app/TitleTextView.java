package london.fela.budget.app;

import android.content.Context;
import android.graphics.Typeface;
import android.util.AttributeSet;
import android.widget.TextView;

/**
 * Title text view (custom font)
 */
public class TitleTextView extends TextView {
    public TitleTextView(Context context, AttributeSet attrs) {
        super(context, attrs);

        this.setTypeface(Typeface.createFromAsset(context.getAssets(), "fonts/Bitter-Bold.ttf"));
    }
}
