import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ApiService } from '../../services/ApiService';
import { DeepLinkHandler } from '../../utils/deepLinkHandler';
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
      // ApiService의 socialLogin 메서드 사용
      const result = await ApiService.socialLogin(
        provider,
        socialAccessToken,
        userProfile,
      );

      if (result.code === 'AUTH_OK_001') {
        console.log('>>>> 로그인 성공!');

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
        console.log('>>>>> 로그인 실패', result);
        showErrorAlert(result.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('>> 로그인 처리 실패:', error);
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
