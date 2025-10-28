import { Colors } from '@/constants/colors';
import { StyleSheet, Text, View } from 'react-native';

export default function Page() {
  return (
    <View style={styles.container}  >
      <Text style={styles.title}>Login</Text>
    </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
  });