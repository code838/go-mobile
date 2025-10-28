import CustomTabBar from '@/components/CustomTabBar';
import { tabConfigs } from '@/config/tabConfig';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: '#0E0E10' }}>
      <View style={{ flex: 1 }}>
        <Tabs
          tabBar={() => null}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: t('tab1'),
            }}
          />
          <Tabs.Screen
            name="ubuy"
            options={{
              title: t('tab2'),
            }}
          />
          <Tabs.Screen
            name="new"
            options={{
              title: t('tab3'),
            }}
          />
          <Tabs.Screen
            name="favorite"
            options={{
              title: t('tab4'),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: t('tab5'),
            }}
          />
        </Tabs>
      </View>
      <CustomTabBar tabs={tabConfigs} />
    </View>
  );
}