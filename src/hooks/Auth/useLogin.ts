import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AsyncStorageService } from '../../services/AsyncStorageService';
import { DeepLinkHandler } from '../../utils/deepLinkHandler';
import { loginAPI } from '../../types/api';
import type { RootStackParamList, SocialProvider } from '../../types/auth';

interface UserProfile {
  providerId: string;
  name: string;
  email?: string;
  profileImage?: string;
}

interface UseLoginReturn {
  isLoading: boolean;
  errorModal: {
    visible: boolean;
    message: string;
  };
  handleSocialLogin: (
    provider: SocialProvider,
    socialAccessToken: string,
    userProfile: UserProfile,
  ) => Promise<void>;
  closeErrorModal: () => void;
}

export const useLogin = (): UseLoginReturn => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
  });

  const showErrorAlert = (message: string): void => {
    setErrorModal({
      visible: true,
      message,
    });
  };

  const closeErrorModal = (): void => {
    setErrorModal({
      visible: false,
      message: '',
    });
  };

  const handleSocialLogin = async (
    provider: SocialProvider,
    socialAccessToken: string,
    userProfile: UserProfile,
  ): Promise<void> => {
    setIsLoading(true);

    try {
      console.log('[Login request] : ', {
        provider,
        accessToken: socialAccessToken.substring(0, 10) + '...',
      });

      const result = await loginAPI(provider, socialAccessToken);

      if (result.code === 'AUTH_OK_001') {
        if (!result.result?.accessToken || !result.result?.refreshToken) {
          throw new Error('서버에서 토큰을 받지 못했습니다.');
        }

        // 서버 토큰, 로그인 상태 저장
        await AsyncStorage.multiSet([
          ['accessToken', result.result.accessToken],
          ['refreshToken', result.result.refreshToken],
          ['isLoggedIn', 'true'],
          ['loginProvider', provider],
          ['lastLoginTime', new Date().toISOString()],
        ]);

        // 사용자 정보 저장
        const user = await AsyncStorageService.createUserFromLogin(
          provider,
          userProfile.providerId,
          userProfile.name,
          userProfile.email,
          userProfile.profileImage,
        );

        await AsyncStorageService.setCurrentUserId(user.id);
        await AsyncStorageService.initializeDefaultFridgeForUser(
          parseInt(user.id, 10),
        );

        // 대기 중인 초대 확인
        const pendingInvite = await DeepLinkHandler.getPendingInvite();

        if (pendingInvite) {
          navigation.replace('InviteConfirm', {
            token: pendingInvite.token,
            fridgeInfo: {
              name: pendingInvite.fridgeName || '냉장고',
              inviterName: pendingInvite.inviterName || '사용자',
              memberCount: pendingInvite.memberCount || 1,
            },
          });
        } else {
          navigation.replace('FridgeSelect');
        }
      } else {
        showErrorAlert(result.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('>> 로그인 API 호출 실패:', error);
      let errorMessage = '네트워크 오류가 발생했습니다. 다시 시도해주세요.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      showErrorAlert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    errorModal,
    handleSocialLogin,
    closeErrorModal,
  };
};
