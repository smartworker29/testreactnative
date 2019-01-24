package inspector.cloud;

import android.app.Application;

import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.bugsnag.BugsnagReactNative;

import com.facebook.react.ReactApplication;
import io.sentry.RNSentryPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.reactnative.photoview.PhotoViewPackage;
import com.ivanwu.googleapiavailabilitybridge.ReactNativeGooglePlayServicesPackage;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.sensors.RNSensorsPackage;
import com.aakashns.reactnativedialogs.ReactNativeDialogsPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.rnfs.RNFSPackage;
import com.github.yamill.orientation.OrientationPackage;
import org.reactnative.camera.RNCameraPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.agontuk.RNFusedLocation.RNFusedLocationPackage;
import com.opensettings.OpenSettingsPackage;

import java.util.Arrays;
import java.util.List;


public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(

            new MainReactPackage(),
            new RNSentryPackage(),
            new RNFetchBlobPackage(),
            new RNGestureHandlerPackage(),
            new PhotoViewPackage(),
            new ReactNativeGooglePlayServicesPackage(),
            new OrientationPackage(),
            new ImageResizerPackage(),
            new RNSensorsPackage(),
            new ReactNativeDialogsPackage(),
            new RNDeviceInfo(),
            new LinearGradientPackage(),
            new RNI18nPackage(),
            new OpenSettingsPackage(),
            new RNFSPackage(),
            new RNCameraPackage(),
            new RNFusedLocationPackage(),
            BugsnagReactNative.getPackage()
            );
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
        BugsnagReactNative.start(this);
        SoLoader.init(this, /* native exopackage */ false);
    }
}
