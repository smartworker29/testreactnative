package inspector.cloud;

import android.app.Application;
import android.content.Context;
import android.support.multidex.MultiDex;
import android.support.multidex.MultiDexApplication;

import com.bugsnag.BugsnagReactNative;
import com.facebook.react.ReactApplication;
import com.microsoft.appcenter.reactnative.analytics.AppCenterReactNativeAnalyticsPackage;
import com.microsoft.appcenter.reactnative.appcenter.AppCenterReactNativePackage;
import com.sensors.RNSensorsPackage;

import io.sentry.RNSentryPackage;

import com.agontuk.RNFusedLocation.RNFusedLocationPackage;
import com.azendoo.reactnativesnackbar.SnackbarPackage;
//import io.sentry.RNSentryPackage;
import com.reactnative.photoview.PhotoViewPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.opensettings.OpenSettingsPackage;
import com.BV.LinearGradient.LinearGradientPackage;

import fr.bamlab.rnimageresizer.ImageResizerPackage;

import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.ivanwu.googleapiavailabilitybridge.ReactNativeGooglePlayServicesPackage;
import com.squareup.leakcanary.LeakCanary;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.rnfs.RNFSPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.aakashns.reactnativedialogs.ReactNativeDialogsPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;

import org.reactnative.camera.RNCameraPackage;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.microsoft.codepush.react.CodePush;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends MultiDexApplication implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected String getJSBundleFile() {
            return CodePush.getJSBundleFile();
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
            new CodePush(BuildConfig.CODEPUSH_KEY, MainApplication.this, BuildConfig.DEBUG),
            new AppCenterReactNativeAnalyticsPackage(MainApplication.this, getResources().getString(R.string.appCenterAnalytics_whenToEnableAnalytics)),
            new AppCenterReactNativePackage(MainApplication.this),
            new RNSensorsPackage(),
                    new RNSentryPackage(),
                    new RNFusedLocationPackage(),
                    new SnackbarPackage(),
                    new PhotoViewPackage(),
                    new OrientationPackage(),
                    new OpenSettingsPackage(),
                    new LinearGradientPackage(),
                    new ImageResizerPackage(),
                    new RNI18nPackage(),
                    new ReactNativeGooglePlayServicesPackage(),
                    new RNGestureHandlerPackage(),
                    new RNFSPackage(),
                    new RNFetchBlobPackage(),
                    new ReactNativeDialogsPackage(),
                    new RNDeviceInfo(),
                    new RNCameraPackage(),
                    BugsnagReactNative.getPackage());

        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
//        if (LeakCanary.isInAnalyzerProcess(this)) {
//            // This process is dedicated to LeakCanary for heap analysis.
//            // You should not init your app in this process.
//            return;
//        }
//        LeakCanary.install(this);
        SoLoader.init(this, /* native exopackage */ false);
    }

    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
        MultiDex.install(this);
    }
}
