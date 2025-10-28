import { BaseToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{borderLeftColor: '#2EBC85', borderLeftWidth: 10, zIndex: 1000}}
      text1Style={{fontSize: 15, fontWeight: '400'}}
    />
  ),
  error: (props: any) => (
    <BaseToast
      {...props}
      style={{borderLeftColor: 'red', borderLeftWidth: 10, zIndex: 1000}}
      text1Style={{fontSize: 15, fontWeight: '400'}}
    />
  ),
};
