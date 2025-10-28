import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export default function Page() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text>{t('tab3')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E10',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
