import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginForm from '../../components/Login/LoginForm';
import InvitationConfirmModal from '../../components/modals/InvitationConfirmModals';
import { useLogin } from '../../hooks/Auth/useLogin';
import { FridgeSettingsAPIService } from '../../services/API/FridgeSettingsAPI';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/auth';

const LoginScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    isLoading,
    errorModal,
    invitationInfo,
    handleSocialLogin,
    closeErrorModal,
    clearInvitationInfo,
  } = useLogin();

  const [showInvitationModal, setShowInvitationModal] = useState(false);

  // invitationInfo가 설정되면 모달 표시
  useEffect(() => {
    if (invitationInfo) {
      setShowInvitationModal(true);
    }
  }, [invitationInfo]);

  const handleInvitationConfirm = async () => {
    if (!invitationInfo) return;

    try {
      // refrigeratorId를 사용 (invitationId 아님!)
      await FridgeSettingsAPIService.joinRefrigeratorByInvitation(
        invitationInfo.refrigeratorId,
      );
      await AsyncStorage.removeItem('pendingInvitationCode');
      clearInvitationInfo();
      setShowInvitationModal(false);
      navigation.replace('FridgeSelect');
    } catch (error) {
      console.error('냉장고 참여 실패:', error);
      await AsyncStorage.removeItem('pendingInvitationCode');
      clearInvitationInfo();
      setShowInvitationModal(false);
      navigation.replace('FridgeSelect');
    }
  };

  const handleInvitationCancel = async () => {
    await AsyncStorage.removeItem('pendingInvitationCode');
    clearInvitationInfo();
    setShowInvitationModal(false);
    navigation.replace('FridgeSelect');
  };

  return (
    <>
      <LoginForm
        isLoading={isLoading}
        errorModal={errorModal}
        onSocialLogin={handleSocialLogin}
        onCloseErrorModal={closeErrorModal}
      />

      <InvitationConfirmModal
        visible={showInvitationModal}
        isLoading={false}
        invitationInfo={
          invitationInfo
            ? {
                refrigeratorName: invitationInfo.refrigeratorName,
                inviterName: invitationInfo.inviterName,
              }
            : null
        }
        onConfirm={handleInvitationConfirm}
        onCancel={handleInvitationCancel}
      />
    </>
  );
};

export default LoginScreen;
