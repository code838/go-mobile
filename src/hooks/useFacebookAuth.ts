import { facebookLogin } from '@/utils/socialAuth';
import { useState } from 'react';

interface UseFacebookAuthProps {
  onSuccess?: (accessToken: string) => void;
  onError?: (error: any) => void;
}

export function useFacebookAuth({ onSuccess, onError }: UseFacebookAuthProps = {}) {
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    setIsLoading(true);
    
    try {
      const result = await facebookLogin();
      
      if (result.success && result.token) {
        console.log('Facebook login success:', result.token);
        onSuccess?.(result.token);
      } else if (result.cancelled) {
        console.log('Facebook login cancelled');
        onError?.({ message: 'User cancelled authentication' });
      } else {
        console.error('Facebook login failed:', result.error);
        onError?.({ message: result.error || 'Facebook登录失败' });
      }
    } catch (error: any) {
      console.error('Facebook login error:', error);
      onError?.({ message: error.message || 'Facebook登录失败' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
  };
}