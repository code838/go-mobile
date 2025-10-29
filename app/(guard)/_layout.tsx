import { Stack } from 'expo-router';

import { useBoundStore } from '@/store';

export default function AppLayout() {
  const user = useBoundStore(state => state.user);
 
  // if (!user) {
  //   return <Redirect href="/login" />;
  // }

  return <Stack screenOptions={{ headerShown: false }} />;
}
