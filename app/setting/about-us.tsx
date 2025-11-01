import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';

export default function AboutUsScreen() {
  const { t } = useTranslation();

  function handlePrivacyPolicy() {
    router.push('/setting/protocol?type=2');
  }

  function handleUserAgreement() {
    router.push('/setting/protocol?type=1');
  }

  function handleVersionUpdate() {
    // TODO: 检查版本更新
  }

  return (
    <View style={styles.container}>
      <PageDecoration />
      <NavigationBar title={t('aboutUs.title')} />
      
      <View style={styles.content}>
        <View style={styles.card}>
          {/* Logo 和版本号 */}
          <View style={styles.logoSection}>
            <LinearGradient
              colors={[Colors.brand, '#67E8F2']}
              style={styles.logo}
            />
            <Text style={styles.version}>{t('aboutUs.version')}</Text>
          </View>

          {/* 隐私政策 */}
          <Pressable 
            style={[styles.menuItem, styles.borderBottom]} 
            onPress={handlePrivacyPolicy}
          >
            <Text style={styles.menuText}>{t('aboutUs.privacyPolicy')}</Text>
            <Image
              source={require('@/assets/images/chevron-right.png')}
              style={styles.chevron}
              contentFit="contain"
            />
          </Pressable>

          {/* 用户协议 */}
          <Pressable 
            style={[styles.menuItem, styles.borderBottom]} 
            onPress={handleUserAgreement}
          >
            <Text style={styles.menuText}>{t('aboutUs.userAgreement')}</Text>
            <Image
              source={require('@/assets/images/chevron-right.png')}
              style={styles.chevron}
              contentFit="contain"
            />
          </Pressable>

          {/* 版本更新 */}
          <Pressable 
            style={styles.menuItem} 
            onPress={handleVersionUpdate}
          >
            <Text style={styles.menuText}>{t('aboutUs.versionUpdate')}</Text>
            <Image
              source={require('@/assets/images/chevron-right.png')}
              style={styles.chevron}
              contentFit="contain"
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 76,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
    gap: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  version: {
    fontSize: 16,
    color: Colors.secondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.title,
    flex: 1,
  },
  chevron: {
    width: 24,
    height: 24,
  },
});

