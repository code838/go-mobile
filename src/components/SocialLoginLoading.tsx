import { Colors } from '@/constants/colors';
import { useBoundStore } from '@/store';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function SocialLoginLoading() {
  const { t } = useTranslation();
  const socialLoginLoading = useBoundStore(state => state.socialLoginLoading);

  if (!socialLoginLoading) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={Colors.brand} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    backgroundColor: Colors.card,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});