import { StyleSheet, Text, View } from 'react-native';

// Android原生Toast风格的自定义Toast组件
const AndroidToast = ({ text1 }: { text1: string }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{text1}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
    maxWidth: '80%',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '400',
  },
});

export const toastConfig = {
  success: (props: any) => <AndroidToast text1={props.text1} />,
  error: (props: any) => <AndroidToast text1={props.text1} />,
  info: (props: any) => <AndroidToast text1={props.text1} />,
};
