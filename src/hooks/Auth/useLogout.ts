import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { logoutAPI } from '../../types/api';
import {
  getAccessToken,
  logout as clearLocalAuth,
} from '../../utils/authUtils';

interface UseLogoutReturn {
  isLoggingOut: boolean;
  handleLogout: () => Promise<void>;
}

export const useLogout = (): UseLogoutReturn => {
  const navigation = useNavigation<any>();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);

    try {
      // 로그아웃 요청
      const accessToken = await getAccessToken();
      if (accessToken) {
        await logoutAPI(accessToken);
      }
    } catch (error) {
      // 서버 로그아웃 실패해도 로컬 데이터는 삭제
    } finally {
      try {
        // 로컬 인증 데이터 삭제
        await clearLocalAuth();

        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } catch (error) {}

      setIsLoggingOut(false);
    }
  };

  return {
    isLoggingOut,
    handleLogout,
  };
};
