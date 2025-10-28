import { Image } from 'expo-image';
import React from 'react';
import { TabConfig } from '../components/CustomTabBar';

// Tab配置 - 你可以轻松修改这些配置
export const tabConfigs: TabConfig[] = [
  {
    id: 'home',
    title: 'tab1',
    icon: <Image source={require('@/assets/images/inactive-tab1.png')} style={{ width: 24, height: 24 }} />,
    activeIcon: <Image source={require('@/assets/images/active-tab1.png')} style={{ width: 24, height: 24 }} />,
    route: '/',
  },
  {
    id: 'search',
    title: 'tab2',
    icon: <Image source={require('@/assets/images/inactive-tab2.png')} style={{ width: 24, height: 24 }} />,
    activeIcon: <Image source={require('@/assets/images/active-tab2.png')} style={{ width: 24, height: 24 }} />,
    route: '/ubuy',
  },
  {
    id: 'center',
    title: 'tab3',
    icon: <Image source={require('@/assets/images/inactive-tab3.png')} style={{ width: 24, height: 24 }} />,
    activeIcon: <Image source={require('@/assets/images/active-tab3.png')} style={{ width: 24, height: 24 }} />,
    route: '/new',
  },
  {
    id: 'message',
    title: 'tab4',
    icon: <Image source={require('@/assets/images/inactive-tab4.png')} style={{ width: 24, height: 24 }} />,
    activeIcon: <Image source={require('@/assets/images/active-tab4.png')} style={{ width: 24, height: 24 }} />,
    route: '/favorite',
  },
  {
    id: 'profile',
    title: 'tab5',
    icon: <Image source={require('@/assets/images/inactive-tab5.png')} style={{ width: 24, height: 24 }} />,
    activeIcon: <Image source={require('@/assets/images/active-tab5.png')} style={{ width: 24, height: 24 }} />,
    route: '/profile',
  },
];