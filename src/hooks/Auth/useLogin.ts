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

        console.log('서버에서 받은 토큰들:', {
          accessToken: result.result.accessToken.substring(0, 20) + '...',
          refreshToken: result.result.refreshToken.substring(0, 20) + '...',
        });

        // 🔥 토큰 저장 순서 및 방식 개선
        try {
          // 1. AsyncStorage에 직접 저장 (기본)
          await AsyncStorage.multiSet([
            ['accessToken', result.result.accessToken],
            ['refreshToken', result.result.refreshToken],
            ['isLoggedIn', 'true'],
            ['loginProvider', provider],
            ['lastLoginTime', new Date().toISOString()],
          ]);

          // 2. AsyncStorageService를 통한 저장 (백업)
          await AsyncStorageService.setAuthToken(result.result.accessToken);
          await AsyncStorageService.setRefreshToken(result.result.refreshToken);

          console.log('토큰 저장 완료');

          // ✅ 여기에 추가: 토큰에서 userId 추출하여 저장
          const { getTokenUserId } = require('../../utils/authUtils');
          const tokenUserId = await getTokenUserId();
          if (tokenUserId) {
            await AsyncStorageService.setCurrentUserId(tokenUserId);
            console.log('토큰에서 추출한 userId 저장:', tokenUserId);
          }

          // 3. 저장 확인
          const savedAccessToken = await AsyncStorage.getItem('accessToken');
          const savedRefreshToken = await AsyncStorage.getItem('refreshToken');

          console.log('저장 확인:', {
            accessToken: savedAccessToken
              ? savedAccessToken.substring(0, 20) + '...'
              : 'null',
            refreshToken: savedRefreshToken
              ? savedRefreshToken.substring(0, 20) + '...'
              : 'null',
          });

          if (!savedAccessToken || !savedRefreshToken) {
            throw new Error('토큰 저장 검증 실패');
          }
        } catch (tokenError) {
          console.error('토큰 저장 실패:', tokenError);
          throw new Error('토큰 저장에 실패했습니다.');
        }

        // 사용자 정보 저장
        console.log('사용자 정보 저장 시작:', userProfile);

        if (!userProfile || typeof userProfile !== 'object') {
          throw new Error('사용자 프로필 정보가 없습니다.');
        }

        const user = await AsyncStorageService.createUserFromLogin(
          provider,
          userProfile.providerId,
          userProfile.name,
          userProfile.email,
          userProfile.profileImage,
        );

        console.log('createUserFromLogin 반환값:', user);

        if (!user || typeof user !== 'object' || !user.id) {
          console.error('사용자 생성 실패: user 객체가 없거나 id가 없음');
          throw new Error('사용자 정보 저장에 실패했습니다.');
        }

        // ❌ 이 줄 삭제
        // await AsyncStorageService.setCurrentUserId(user.id);

        // ✅ 토큰의 userId는 이미 100번째 줄에서 저장했으므로
        // 여기서는 setCurrentUserId를 호출하지 않음
        console.log('토큰 userId(3)가 currentUserId로 설정됨');

        // 기본 냉장고 설정
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
