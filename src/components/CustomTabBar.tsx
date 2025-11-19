import { Colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shadow } from 'react-native-shadow-2';
import CustomBottomShape from './CustomTabShape';

export interface TabConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  route: string;
}

interface CustomTabBarProps {
  tabs: TabConfig[];
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ tabs }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const currentRoute = pathname.split('/')[1] || '';

  const handleTabPress = (tab: TabConfig, index: number) => {
    router.push(tab.route as any);
  };

  const renderTabIcon = (tab: TabConfig, index: number, isActive: boolean) => {
    const iconToRender = isActive && tab.activeIcon ? tab.activeIcon : tab.icon;

    if (index === 2) {
      return (
        <View style={styles.centerButton}>
          {/* @ts-ignore */}
          <Shadow
            distance={5}
            startColor={'rgba(103, 65, 255, 0.3)'}
            offset={[0, 2]}>
            {isActive ? (
              <LinearGradient
                colors={['#689EF8', '#6741FF']}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.centerIconContainer}
              >
                {iconToRender}
              </LinearGradient>
            ) : (
              <View style={[styles.centerIconContainer]}>
                {iconToRender}
              </View>
            )}
          </Shadow>
        </View>
      );
    }

    return iconToRender;
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <CustomBottomShape backgroundColor="#141414" />
      <View style={[styles.tabsContainer]}>
        {tabs.map((tab, index) => {
          const isActive = currentRoute === tab.route.replace('/', '') ||
            (currentRoute === '' && tab.route === '/');
          return (
            <TouchableWithoutFeedback
              key={tab.id}
              onPress={() => handleTabPress(tab, index)}
            >
              <View style={[
                styles.tab,
                index === 2 && styles.centerTab
              ]}>
                {renderTabIcon(tab, index, isActive)}
                <Text style={[styles.tabText, { color: isActive ? Colors.activeTab : Colors.inactiveTab }]}>
                  {t(tab.title)}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  svgContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'flex-end',
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    height: 60,
  },
  centerTab: {
    height: 90,
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingTop: 20,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    backgroundColor: '#303030',
  },
  tabText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center'
  },
});

export default CustomTabBar;