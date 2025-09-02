import React from 'react';
import { View, Text } from 'react-native';
import type { SocialProvider } from '../../types/auth';
import KakaoLoginButton from './KakaoLoginButton';
import NaverLoginButton from './NaverLoginButton';
import ConfirmModal from '../modals/ConfirmModal';
import { styles } from './styles';

interface UserProfile {
  providerId: string;
  name: string;
  email?: string;
  profileImage?: string;
}

interface LoginFormProps {
  isLoading: boolean;
  errorModal: {
    visible: boolean;
    message: string;
  };
  onSocialLogin: (
    provider: SocialProvider,
    socialAccessToken: string,
    userProfile: UserProfile,
  ) => Promise<void>;
  onCloseErrorModal: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  isLoading,
  errorModal,
  onSocialLogin,
  onCloseErrorModal,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <View style={styles.header}>
          <Text style={styles.headerText}>로그인</Text>
        </View>
        <View style={styles.buttonWrapper}>
          <KakaoLoginButton
            isLoading={isLoading}
            setIsLoading={() => {}} // 이제 useLogin에서 관리하므로 빈 함수
            handleSocialLoginWithAPI={onSocialLogin}
            showErrorAlert={() => {}} // 에러도 useLogin에서 처리
          />
          <NaverLoginButton
            isLoading={isLoading}
            setIsLoading={() => {}} // 이제 useLogin에서 관리하므로 빈 함수
            handleSocialLoginWithAPI={onSocialLogin}
            showErrorAlert={() => {}} // 에러도 useLogin에서 처리
          />
        </View>
      </View>

      {/* 에러 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={errorModal.visible}
        title="로그인 실패"
        message={errorModal.message}
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{
          name: 'error-outline',
          color: 'tomato',
          size: 48,
        }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={onCloseErrorModal}
        onCancel={onCloseErrorModal}
      />
    </View>
  );
};

export default LoginForm;
