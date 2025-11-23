//
import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Share,
  Linking,
  Text,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
//
import ModalSettingsItem from './ModalSettingsItem';
import InviteMemberModals from '../../modals/InviteMemberModals';
import { FridgeSettingsAPIService } from '../../../services/API/FridgeSettingsAPI';
//
import { inviteMemberModalStyle as styles } from './styles';

type InviteMemberModalProps = {
  visible: boolean;
  fridgeId: number;
  fridgeName: string;
  onClose: () => void;
  onInviteSuccess?: () => void;
};

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  visible,
  fridgeId,
  fridgeName,
  onClose,
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ConfirmModal States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [smsFailedVisible, setSmsFailedVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [kakaoFailedVisible, setKakaoFailedVisible] = useState(false);
  const [shareFailedVisible, setShareFailedVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [smsNotSupportedVisible, setSmsNotSupportedVisible] = useState(false);
  const [regenerateConfirmVisible, setRegenerateConfirmVisible] =
    useState(false);
  const [kakaoNotInstalledVisible, setKakaoNotInstalledVisible] =
    useState(false);

  // 초대 링크 로드
  const loadInviteCode = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const link = await FridgeSettingsAPIService.generateInviteCode(
        fridgeId,
        fridgeName,
      );
      setInviteCode(link);
    } catch (error) {
      console.error('초대 링크 로드 실패:', error);
      setErrorMessage('초대 링크를 생성할 수 없습니다.');
      setErrorModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  }, [fridgeId, fridgeName]);

  // 컴포넌트가 보여질 때 초대 링크 로드
  useEffect(() => {
    if (visible) {
      loadInviteCode();
    }
  }, [visible, loadInviteCode]);

  // 초대 링크 재생성 실행
  const handleRegenerateConfirm = async () => {
    try {
      setIsLoading(true);
      const newCode = await FridgeSettingsAPIService.generateInviteCode(
        fridgeId,
        fridgeName,
      );
      setInviteCode(newCode);
      setSuccessMessage('새로운 초대 링크가 생성되었습니다.');
      setSuccessModalVisible(true);
    } catch (error) {
      console.error('초대 링크 재생성 실패:', error);
      setErrorMessage('초대 링크 재생성에 실패했습니다.');
      setErrorModalVisible(true);
    } finally {
      setIsLoading(false);
      setRegenerateConfirmVisible(false);
    }
  };

  // 클립보드에 복사
  const copyToClipboard = async () => {
    try {
      await Clipboard.setString(inviteCode);
      setSuccessMessage('초대 링크가 클립보드에 복사되었습니다.');
      setSuccessModalVisible(true);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      // 에러 발생 시 공유 기능으로 대체
      shareGeneral();
    }
  };

  // 문자 메시지로 공유
  const shareToSMS = () => {
    const message = `🏠 ${fridgeName} 냉장고에 초대되었습니다!\n\n초대 링크: ${inviteCode}\n\n앱에서 '냉장고 참여하기'를 눌러 위 링크를 입력해주세요!`;
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;

    Linking.canOpenURL(smsUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(smsUrl);
        } else {
          setSmsNotSupportedVisible(true);
        }
      })
      .catch(() => {
        setSmsFailedVisible(true);
      });
  };

  // 카카오톡으로 공유
  const shareToKakaoTalk = () => {
    const message = `🏠 ${fridgeName} 냉장고에 초대되었습니다!\n\n초대 링크: ${inviteCode}\n\n앱에서 '냉장고 참여하기'를 눌러 위 링크를 입력해주세요!`;
    const encodedMessage = encodeURIComponent(message);
    const kakaoUrl = `kakaotalk://send?text=${encodedMessage}`;

    Linking.canOpenURL(kakaoUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(kakaoUrl);
        } else {
          setKakaoNotInstalledVisible(true);
        }
      })
      .catch(() => {
        setKakaoFailedVisible(true);
      });
  };

  // 일반 공유
  const shareGeneral = () => {
    const message = `🏠 ${fridgeName} 냉장고에 초대되었습니다!\n\n초대 링크: ${inviteCode}\n\n앱에서 '냉장고 참여하기'를 눌러 위 링크를 입력해주세요!`;

    Share.share({
      message,
      title: `${fridgeName} 냉장고 초대`,
    }).catch(() => {
      setShareFailedVisible(true);
    });
  };

  // 카카오톡 실패 시 일반 공유로 fallback
  const handleKakaoFallbackToGeneral = () => {
    shareGeneral();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View>
              {/* 냉장고 정보 */}
              <View style={styles.inviteSection}>
                <Text style={styles.fridgeNameText}>{fridgeName}</Text>
                <Text style={styles.fridgeSubText}>
                  초대 링크를 공유해서 멤버를 초대하세요
                </Text>
              </View>

              {/* 초대 링크 */}
              <View style={styles.settingsGroup}>
                <View style={styles.linkContainer}>
                  <View style={styles.linkTextContainer}>
                    <Text style={styles.linkText}>
                      {isLoading ? '생성 중...' : inviteCode}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.copyButton,
                      (!inviteCode || isLoading) && styles.disabledButton,
                    ]}
                    onPress={copyToClipboard}
                    disabled={isLoading || !inviteCode}
                  >
                    <Text style={styles.copyButtonText}>복사</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 공유 방법 */}
              <View style={styles.settingsGroup}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupTitle}>공유 방법</Text>
                </View>

                <ModalSettingsItem
                  title="카카오톡으로 공유"
                  icon="chatbubble-outline"
                  iconColor="#2F4858"
                  onPress={shareToKakaoTalk}
                />
                <ModalSettingsItem
                  title="문자로 공유"
                  icon="mail-outline"
                  iconColor="#2F4858"
                  onPress={shareToSMS}
                />
                <ModalSettingsItem
                  title="더 많은 공유 방법"
                  icon="share-outline"
                  iconColor="#2F4858"
                  onPress={shareGeneral}
                  isLast={true}
                />
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 모든 ConfirmModal들 */}
      <InviteMemberModals
        errorMessage={errorMessage}
        successMessage={successMessage}
        smsFailedVisible={smsFailedVisible}
        errorModalVisible={errorModalVisible}
        kakaoFailedVisible={kakaoFailedVisible}
        shareFailedVisible={shareFailedVisible}
        successModalVisible={successModalVisible}
        setSmsFailedVisible={setSmsFailedVisible}
        setErrorModalVisible={setErrorModalVisible}
        onRegenerateConfirm={handleRegenerateConfirm}
        setKakaoFailedVisible={setKakaoFailedVisible}
        setShareFailedVisible={setShareFailedVisible}
        setSuccessModalVisible={setSuccessModalVisible}
        smsNotSupportedVisible={smsNotSupportedVisible}
        kakaoNotInstalledVisible={kakaoNotInstalledVisible}
        regenerateConfirmVisible={regenerateConfirmVisible}
        setSmsNotSupportedVisible={setSmsNotSupportedVisible}
        setRegenerateConfirmVisible={setRegenerateConfirmVisible}
        setKakaoNotInstalledVisible={setKakaoNotInstalledVisible}
        onKakaoFallbackToGeneral={handleKakaoFallbackToGeneral}
      />
    </>
  );
};

export default InviteMemberModal;
