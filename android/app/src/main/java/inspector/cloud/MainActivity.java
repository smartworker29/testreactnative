package inspector.cloud;

import com.facebook.react.ReactActivity;
import io.sentry.Sentry;
import io.sentry.android.AndroidSentryClientFactory;
import android.app.Activity;
import android.os.Bundle;
import android.content.Context;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "CloudInspector";
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Context ctx = this.getApplicationContext();
        // Use the Sentry DSN (client key) from the Project Settings page on Sentry
        String sentryDsn = "https://b9301509de784d7a9ae6fa88ad3f3ec5@sentry.inspector-cloud.ru/6";
        Sentry.init(sentryDsn, new AndroidSentryClientFactory(ctx));
    }
}
