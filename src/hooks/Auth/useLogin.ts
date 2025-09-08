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

        // 사용자 정보 저장 - 개별 파라미터로 전달
        console.log('사용자 정보 저장 시작:', userProfile);

        if (!userProfile || typeof userProfile !== 'object') {
          throw new Error('사용자 프로필 정보가 없습니다.');
        }

        // 개별 파라미터로 전달 (TypeScript 에러 해결)
        const user = await AsyncStorageService.createUserFromLogin(
          provider,
          userProfile.providerId,
          userProfile.name,
          userProfile.email,
          userProfile.profileImage,
        );

        console.log('createUserFromLogin 반환값:', user);

        // user가 정상적으로 반환되었는지 확인
        if (!user || typeof user !== 'object' || !user.id) {
          console.error('사용자 생성 실패: user 객체가 없거나 id가 없음');
          throw new Error('사용자 정보 저장에 실패했습니다.');
        }

        await AsyncStorageService.setCurrentUserId(user.id);

        // 기본 냉장고 설정 (단순화)
        try {
          await AsyncStorage.setItem('hasDefaultFridge', 'true');
          await AsyncStorage.setItem('defaultFridgeUserId', user.id);
          console.log('기본 냉장고 설정 완료');
        } catch (fridgeError) {
          console.warn('기본 냉장고 초기화 실패:', fridgeError);
        }

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
