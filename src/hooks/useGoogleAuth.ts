import { googleLogin } from '@/utils/socialAuth';
import { useState } from 'react';

interface UseGoogleAuthProps {
  onSuccess?: (idToken: string) => void;
  onError?: (error: any) => void;
}

export function useGoogleAuth({ onSuccess, onError }: UseGoogleAuthProps = {}) {
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    setIsLoading(true);
    
    try {
      console.log('Google login start');
      const result = await googleLogin();

      console.log('Google login result:', result);
      if (result.success && result.token) {
        console.log('Google login success:', result.token);
        onSuccess?.(result.token);
      } else if (result.cancelled) {
        console.log('Google login cancelled');
        onError?.({ message: 'User cancelled authentication' });
      } else {
        console.error('Google login failed:', result.error);
        onError?.({ message: result.error || 'Google登录失败' });
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      onError?.({ message: error.message || 'Google登录失败' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
  };
}