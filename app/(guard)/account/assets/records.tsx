import { StyleSheet, Text, View } from 'react-native';

import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';

export default function RecordsPage() {
  return (
    <View style={styles.container}>
      <PageDecoration />
      <NavigationBar title="记录" />
      <View style={styles.content}>
        <Text style={styles.text}>记录页面</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: Colors.subtitle,
  },
});

