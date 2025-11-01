import '@/config/i18n';
import { toastConfig } from '@/config/toastConfig';
import { useBoundStore } from '@/store';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();
LogBox.ignoreAllLogs();


export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const getCoinsMessage = useBoundStore(state => state.getCoinsMessage);

  const initApp = async () => {
    await getCoinsMessage();
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

        <StatusBar style="light" />
      </GestureHandlerRootView>
      <Toast position={'top'} topOffset={insets.top} config={toastConfig} />
    </>
  );
}
