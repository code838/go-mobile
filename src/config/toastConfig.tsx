import { BaseToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{borderLeftColor: '#2EBC85', borderLeftWidth: 4, zIndex: 1000, height: 50}}
      text1Style={{fontSize: 15, fontWeight: '400'}}
    />
  ),
  error: (props: any) => (
    <BaseToast
      {...props}
      style={{borderLeftColor: 'red', borderLeftWidth: 4, zIndex: 1000, height: 50}}
      text1Style={{fontSize: 15, fontWeight: '400'}}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{borderLeftColor: '#6741FF', borderLeftWidth: 4, zIndex: 1000, height: 50}}
      text1Style={{fontSize: 15, fontWeight: '400'}}
    />
  ),
};
