import NavigationBar from '@/components/NavigationBar';
import { changeLanguage } from '@/config/i18n';
import { Colors } from '@/constants/colors';
import { useBoundStore } from '@/store';
import FeatherIcon from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * 语言切换页面
 */
export default function LanguageScreen() {
  const { t } = useTranslation();
  const currentLanguage = useBoundStore(state => state.language);
  const languageList = useBoundStore(state => state.languageList);


  async function handleLanguageChange(languageCode: string) {
    try {
      await changeLanguage(languageCode);
    } catch (error) {
      console.error('切换语言失败:', error);
    }
  }

  return (
    <LinearGradient
      colors={['rgba(103, 65, 255, 0.1)', 'rgba(103, 65, 255, 0)', Colors.background]}
      locations={[0, 0.43, 0.43]}
      style={styles.container}>
      <NavigationBar title={t('language.title')} />

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.languageList}>
            {languageList.map((language, index) => {
              const isSelected = currentLanguage === language.langflag;
              const isFirst = index === 0;
              const isLast = index === languageList.length - 1;

              return (
                <Pressable
                  key={language.langflag}
                  onPress={() => handleLanguageChange(language.langflag)}
                  style={[
                    styles.languageItem,
                    isFirst && styles.languageItemFirst,
                    isLast && styles.languageItemLast,
                  ]}>
                  <Text style={[
                    styles.languageText,
                    isSelected && styles.languageTextSelected,
                  ]}>
                    {language.langname}
                  </Text>

                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <FeatherIcon name="check" size={16} color="white" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
          <View style={{ height: 100 }}></View>
        </ScrollView>
      </View>
    </LinearGradient>
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
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  languageList: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 56,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  languageItemFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  languageItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.title,
  },
  languageTextSelected: {
    color: Colors.brand,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

