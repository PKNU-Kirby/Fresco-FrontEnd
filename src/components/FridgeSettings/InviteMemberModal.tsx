import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Clipboard,
  Share,
  Linking,
  Text,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ConfirmModal from '../modals/ConfirmModal';
import { FridgeSettingsAPIService } from '../../services/API/FridgeSettingsAPI';
import { inviteMemberModalStyle as styles } from './styles';

type InviteMemberModalProps = {
  fridgeId: number;
  visible: boolean;
  fridgeName: string;
  onClose: () => void;
  onInviteSuccess?: () => void;
};

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  visible,
  fridgeId,
  fridgeName,
  onClose,
  onInviteSuccess,
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ConfirmModal 상태들
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

  // 초대 링크 재생성 확인
  const regenerateCode = () => {
    setRegenerateConfirmVisible(true);
  };

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
    }
  };

  // 클립보드에 복사
  const copyToClipboard = () => {
    Clipboard.setString(inviteCode);
    setSuccessMessage('초대 링크가 클립보드에 복사되었습니다.');
    setSuccessModalVisible(true);
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

  // 공유 아이템 컴포넌트
  const ModalSettingsItem: React.FC<{
    title: string;
    icon: string;
    iconColor: string;
    onPress: () => void;
    isLast?: boolean;
  }> = ({ title, icon, iconColor, onPress, isLast = false }) => (
    <TouchableOpacity
      style={[styles.settingsItem, isLast && styles.settingsItemLast]}
      onPress={onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.settingsItemIcon, { backgroundColor: iconColor }]}>
          <Ionicons name={icon} size={20} color="#f8f8f8" />
        </View>
        <View style={styles.settingsItemContent}>
          <Text style={styles.settingsItemTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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

      {/* 에러 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={errorModalVisible}
        title="오류"
        message={errorMessage}
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => setErrorModalVisible(false)}
        onCancel={() => setErrorModalVisible(false)}
      />

      {/* 성공 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={successModalVisible}
        title="완료"
        message={successMessage}
        iconContainer={{ backgroundColor: '#d3f0d3' }}
        icon={{ name: 'check', color: 'limegreen', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => setSuccessModalVisible(false)}
        onCancel={() => setSuccessModalVisible(false)}
      />
      {/* 초대 링크 재생성 확인 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={regenerateConfirmVisible}
        title="초대 링크 재생성"
        message="새로운 초대 링크를 생성하시겠습니까?\n기존 링크는 더 이상 사용할 수 없습니다."
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="생성"
        cancelText="취소"
        confirmButtonStyle="danger"
        onConfirm={handleRegenerateConfirm}
        onCancel={() => setRegenerateConfirmVisible(false)}
      />
      {/* SMS 지원 안함 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={smsNotSupportedVisible}
        title="SMS 지원 안함"
        message="이 기기에서는 SMS를 지원하지 않습니다."
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => setSmsNotSupportedVisible(false)}
        onCancel={() => setSmsNotSupportedVisible(false)}
      />
      {/* SMS 공유 실패 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={smsFailedVisible}
        title="SMS 공유 실패"
        message="SMS 공유에 실패했습니다."
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => setSmsFailedVisible(false)}
        onCancel={() => setSmsFailedVisible(false)}
      />
      {/* 카카오톡 미설치 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={kakaoNotInstalledVisible}
        title="카카오톡 미설치"
        message="카카오톡이 설치되어 있지 않습니다. 다른 방법으로 공유하시겠습니까?"
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="웹 공유"
        cancelText="취소"
        confirmButtonStyle="primary"
        onConfirm={() => {
          setKakaoNotInstalledVisible(false);
          shareGeneral();
        }}
        onCancel={() => setKakaoNotInstalledVisible(false)}
      />
      {/* 카카오톡 공유 실패 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={kakaoFailedVisible}
        title="공유 실패"
        message="카카오톡 공유에 실패했습니다. 다른 방법으로 공유하시겠습니까?"
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="웹 공유"
        cancelText="취소"
        confirmButtonStyle="primary"
        onConfirm={() => {
          setKakaoFailedVisible(false);
          shareGeneral();
        }}
        onCancel={() => setKakaoFailedVisible(false)}
      />

      {/* 일반 공유 실패 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={shareFailedVisible}
        title="공유 실패"
        message="공유에 실패했습니다."
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => setShareFailedVisible(false)}
        onCancel={() => setShareFailedVisible(false)}
      />
    </>
  );
};

export default InviteMemberModal;
