import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SocialProvider } from '../../types/auth';
import KakaoLoginButton from './KakaoLoginButton';
import NaverLoginButton from './NaverLoginButton';
import ConfirmModal from '../modals/ConfirmModal';
import InvitationCodeModal from '../modals/InvitationCodeModal';
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
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [pendingInvitationCode, setPendingInvitationCode] = useState<
    string | null
  >(null);

  // 컴포넌트 마운트 시 저장된 초대코드 확인
  useEffect(() => {
    const checkPendingCode = async () => {
      const code = await AsyncStorage.getItem('pendingInvitationCode');
      setPendingInvitationCode(code);
    };
    checkPendingCode();
  }, []);

  const handleInvitationConfirm = async () => {
    // 초대코드 저장 후 버튼 텍스트 업데이트
    const code = await AsyncStorage.getItem('pendingInvitationCode');
    setPendingInvitationCode(code);
    setShowInvitationModal(false);
  };

  const handleInvitationModalClose = () => {
    setShowInvitationModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <View style={styles.header}>
          <Text style={styles.headerText}>로그인</Text>
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[
              styles.invitationButton,
              isLoading && styles.invitationButtonDisabled,
            ]}
            onPress={() => setShowInvitationModal(true)}
            disabled={isLoading}
          >
            <Text style={styles.invitationButtonText}>
              {pendingInvitationCode
                ? `초대코드: ${pendingInvitationCode}`
                : '초대코드로 시작하기'}
            </Text>
          </TouchableOpacity>

          <KakaoLoginButton
            isLoading={isLoading}
            setIsLoading={() => {}}
            handleSocialLoginWithAPI={onSocialLogin}
            showErrorAlert={() => {}}
          />
          <NaverLoginButton
            isLoading={isLoading}
            setIsLoading={() => {}}
            handleSocialLoginWithAPI={onSocialLogin}
            showErrorAlert={() => {}}
          />
        </View>
      </View>

      {/* 에러 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={errorModal.visible}
        title="로그인 실패"
        message={errorModal.message}
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{
          name: 'error-outline',
          color: '#FF6B6B',
          size: 48,
        }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={onCloseErrorModal}
        onCancel={onCloseErrorModal}
      />

      {/* 초대코드 입력 모달 */}
      <InvitationCodeModal
        visible={showInvitationModal}
        onClose={handleInvitationModalClose}
        onConfirm={handleInvitationConfirm}
      />
    </View>
  );
};

export default LoginForm;
