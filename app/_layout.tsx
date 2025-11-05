import '@/config/i18n';
import { toastConfig } from '@/config/toastConfig';
import { useBoundStore } from '@/store';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export const unstable_settings = {
  anchor: '(tabs)',
};

WebBrowser.maybeCompleteAuthSession();
SplashScreen.preventAutoHideAsync();
LogBox.ignoreAllLogs();


export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const getCoinsMessage = useBoundStore(state => state.getCoinsMessage);
  const getThirdLoginInfo = useBoundStore(state => state.getThirdLoginInfo);

  const initApp = async () => {
    await getCoinsMessage();
    await getThirdLoginInfo();
    SplashScreen.hideAsync();
  }

  useEffect(() => {
    initApp();
  }, []);

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaProvider>

        <StatusBar style="light" backgroundColor="#0E0E10" translucent={false} />
      </GestureHandlerRootView>
      <Toast position={'top'} topOffset={insets.top} config={toastConfig} />
    </>
  );
}
