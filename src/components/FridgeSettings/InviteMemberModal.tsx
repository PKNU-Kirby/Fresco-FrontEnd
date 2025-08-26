import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Alert,
  Clipboard,
  Share,
  Linking,
  Text,
  ActivityIndicator,
} from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { AsyncStorageService } from '../../services/AsyncStorageService';
import { inviteMemberModalStyles as styles } from './styles';

type InviteMemberModalProps = {
  visible: boolean;
  onClose: () => void;
  fridgeId: number;
  fridgeName: string;
  onInviteSuccess?: () => void;
};

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  visible,
  onClose,
  fridgeId,
  fridgeName,
  onInviteSuccess,
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 초대 코드 로드
  const loadInviteCode = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const code = await AsyncStorageService.getFridgeInviteCode(fridgeId);
      if (code) {
        setInviteCode(code);
      } else {
        Alert.alert('오류', '초대 코드를 생성할 수 없습니다.');
      }
    } catch (error) {
      console.error('초대 코드 로드 실패:', error);
      Alert.alert('오류', '초대 코드를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [fridgeId]);

  // 컴포넌트가 보여질 때 초대 코드 로드
  useEffect(() => {
    if (visible) {
      loadInviteCode();
    }
  }, [visible, loadInviteCode]);

  // 초대 코드 재생성
  const regenerateCode = async () => {
    Alert.alert(
      '초대 코드 재생성',
      '새로운 초대 코드를 생성하시겠습니까?\n기존 코드는 더 이상 사용할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '생성',
          onPress: async () => {
            try {
              setIsLoading(true);
              const newCode = await AsyncStorageService.regenerateInviteCode(
                fridgeId,
              );
              if (newCode) {
                setInviteCode(newCode);
                Alert.alert('완료', '새로운 초대 코드가 생성되었습니다.');
              } else {
                Alert.alert('오류', '초대 코드 재생성에 실패했습니다.');
              }
            } catch (error) {
              console.error('초대 코드 재생성 실패:', error);
              Alert.alert('오류', '초대 코드 재생성 중 오류가 발생했습니다.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  // 클립보드에 복사
  const copyToClipboard = () => {
    Clipboard.setString(inviteCode);
    Alert.alert('복사 완료', '초대 코드가 클립보드에 복사되었습니다.');
  };

  // 카카오톡으로 공유
  const shareToKakaoTalk = () => {
    const message = `🏠 ${fridgeName} 냉장고에 초대되었습니다!\n\n초대 코드: ${inviteCode}\n\n앱에서 '냉장고 참여하기'를 눌러 위 코드를 입력해주세요!`;
    const encodedMessage = encodeURIComponent(message);
    const kakaoUrl = `kakaotalk://send?text=${encodedMessage}`;

    Linking.canOpenURL(kakaoUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(kakaoUrl);
        } else {
          Alert.alert(
            '카카오톡 미설치',
            '카카오톡이 설치되어 있지 않습니다. 다른 방법으로 공유하시겠습니까?',
            [
              { text: '취소', style: 'cancel' },
              { text: '웹 공유', onPress: shareGeneral },
            ],
          );
        }
      })
      .catch(() => {
        Alert.alert(
          '공유 실패',
          '카카오톡 공유에 실패했습니다. 다른 방법으로 공유하시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            { text: '웹 공유', onPress: shareGeneral },
          ],
        );
      });
  };

  // 문자로 공유
  const shareToSMS = () => {
    const message = `🏠 ${fridgeName} 냉장고에 초대되었습니다!\n\n초대 코드: ${inviteCode}\n\n앱에서 '냉장고 참여하기'를 눌러 위 코드를 입력해주세요!`;
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;

    Linking.openURL(smsUrl).catch(() => {
      Alert.alert('오류', '문자 앱을 열 수 없습니다.');
    });
  };

  // 일반 공유
  const shareGeneral = () => {
    const message = `🏠 ${fridgeName} 냉장고에 초대되었습니다!\n\n초대 코드: ${inviteCode}\n\n앱에서 '냉장고 참여하기'를 눌러 위 코드를 입력해주세요!`;

    Share.share({
      message,
      title: `${fridgeName} 냉장고 초대`,
    }).catch(() => {
      Alert.alert('공유 실패', '공유에 실패했습니다.');
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.inviteModalContent}>
          {/* 헤더 */}
          <View style={styles.inviteModalHeader}>
            <Text style={styles.invisiblebox}>x</Text>
            <Text style={styles.inviteModalTitle}>구성원 초대</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 냉장고 정보 */}
          <View style={styles.fridgeInfoSection}>
            <Text style={styles.fridgeNameText}>{fridgeName}</Text>
            <Text style={styles.fridgeSubText}>
              아래 초대 코드를 공유해서 구성원을 초대하세요
            </Text>
          </View>

          {/* 초대 코드 */}
          <View style={styles.linkSection}>
            <View style={styles.linkContainer}>
              <View style={styles.linkTextContainer}>
                <Text style={styles.linkText}>
                  초대 코드: {isLoading ? '생성 중...' : inviteCode}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.copyLinkButton,
                  (!inviteCode || isLoading) && styles.disabledButton,
                ]}
                onPress={copyToClipboard}
                disabled={isLoading || !inviteCode}
              >
                <Text style={styles.copyLinkButtonText}>복사</Text>
              </TouchableOpacity>
            </View>

            {/* 코드 재생성 버튼 */}
            <TouchableOpacity
              style={[
                styles.regenerateButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={regenerateCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <Text style={styles.regenerateButtonText}>새 코드 생성</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 공유 버튼들 */}
          <View style={styles.shareSection}>
            <View style={styles.shareButtons}>
              <TouchableOpacity
                style={[
                  styles.shareButton,
                  !inviteCode && styles.disabledShareButton,
                ]}
                onPress={shareToKakaoTalk}
                disabled={!inviteCode}
              >
                <View style={styles.shareButtonIcon}>
                  <FontAwesome6 name="comment" size={24} color="#FEE500" />
                </View>
                <Text style={styles.shareButtonText}>카카오톡</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.shareButton,
                  !inviteCode && styles.disabledShareButton,
                ]}
                onPress={shareToSMS}
                disabled={!inviteCode}
              >
                <View style={styles.shareButtonIcon}>
                  <FontAwesome6 name="message" size={24} color="#333" />
                </View>
                <Text style={styles.shareButtonText}>문자</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.shareButton,
                  !inviteCode && styles.disabledShareButton,
                ]}
                onPress={shareGeneral}
                disabled={!inviteCode}
              >
                <View style={styles.shareButtonIcon}>
                  <FontAwesome6 name="share" size={24} color="#333" />
                </View>
                <Text style={styles.shareButtonText}>더보기</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.shareButton,
                  !inviteCode && styles.disabledShareButton,
                ]}
                onPress={copyToClipboard}
                disabled={!inviteCode}
              >
                <View style={styles.shareButtonIcon}>
                  <FontAwesome6 name="clipboard" size={24} color="#333" />
                </View>
                <Text style={styles.shareButtonText}>복사하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default InviteMemberModal;
