import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Page() {
  const { t } = useTranslation();
  const router = useRouter();   
  return (
    <View style={styles.container}>
      <Text>{t('tab5')}</Text>
      <Button title="Login" onPress={() => router.push('/login')} />
      <Button title="recharge" onPress={() => router.push('/setting/recharge')} />
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
