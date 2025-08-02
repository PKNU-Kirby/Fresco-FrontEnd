import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Alert,
  Clipboard,
  Share,
  Linking,
} from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import CustomText from '../../common/CustomText';
import { styles } from './styles';

type InviteMemberModalProps = {
  visible: boolean;
  onClose: () => void;
  fridgeId: number;
  fridgeName: string;
};

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  visible,
  onClose,
  fridgeId,
  fridgeName,
}) => {
  const [inviteLink, setInviteLink] = useState('');

  // 초대 링크 생성
  const generateInviteLink = React.useCallback(() => {
    // 서버에서 고유 링크를 생성
    const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const link = `https://fresco/invite/${fridgeId}?code=${uniqueCode}`;
    setInviteLink(link);
  }, [fridgeId]);

  // 컴포넌트가 보여질 때 초대 링크 생성
  useEffect(() => {
    if (visible) {
      generateInviteLink();
    }
  }, [visible, fridgeId, generateInviteLink]);

  // 클립보드에 복사
  const copyToClipboard = () => {
    Clipboard.setString(inviteLink);
    Alert.alert('복사 완료', '초대 링크가 클립보드에 복사되었습니다.');
  };

  // 카카오톡으로 공유 (URL 스킴 사용)
  const shareToKakaoTalk = () => {
    const message = `🏠 ${fridgeName} 냉장고에 초대되었습니다!\n\n아래 링크를 클릭해서 참여해주세요:\n${inviteLink}`;
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
    const message = `🏠 ${fridgeName} 냉장고에 초대되었습니다!\n\n아래 링크를 클릭해서 참여해주세요:\n${inviteLink}`;
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;

    Linking.openURL(smsUrl).catch(() => {
      Alert.alert('오류', '문자 앱을 열 수 없습니다.');
    });
  };

  // 일반 공유 (다른 앱들)
  const shareGeneral = () => {
    const message = `🏠 ${fridgeName} 냉장고에 초대되었습니다!\n\n아래 링크를 클릭해서 참여해주세요:\n${inviteLink}`;

    Share.share({
      message,
      title: `${fridgeName} 냉장고 초대`,
      url: inviteLink,
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
            <CustomText style={styles.invisiblebox}>x</CustomText>
            <CustomText style={styles.inviteModalTitle}>구성원 초대</CustomText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <CustomText style={styles.closeButtonText}>✕</CustomText>
            </TouchableOpacity>
          </View>

          {/* 냉장고 정보 */}
          <View style={styles.fridgeInfoSection}>
            <CustomText style={styles.fridgeNameText}>{fridgeName}</CustomText>
            <CustomText style={styles.fridgeSubText}>
              아래 링크를 공유해서 구성원을 초대하세요
            </CustomText>
          </View>

          {/* 초대 링크 */}
          <View style={styles.linkSection}>
            <View style={styles.linkContainer}>
              <View style={styles.linkTextContainer}>
                <CustomText style={styles.linkText} numberOfLines={1}>
                  초대 링크 : {inviteLink}
                </CustomText>
              </View>
              <TouchableOpacity
                style={styles.copyLinkButton}
                onPress={copyToClipboard}
              >
                <CustomText style={styles.copyLinkButtonText}>복사</CustomText>
              </TouchableOpacity>
            </View>
          </View>

          {/* 공유 버튼들 */}
          <View style={styles.shareSection}>
            <View style={styles.shareButtons}>
              {/* 카카오톡 */}
              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareToKakaoTalk}
              >
                <View style={styles.shareButtonIcon}>
                  <FontAwesome6 name="comment" size={24} color="#FEE500" />
                </View>
                <CustomText style={styles.shareButtonText}>카카오톡</CustomText>
              </TouchableOpacity>

              {/* 문자 */}
              <TouchableOpacity style={styles.shareButton} onPress={shareToSMS}>
                <View style={styles.shareButtonIcon}>
                  <FontAwesome6 name="message" size={24} color="#333" />
                </View>
                <CustomText style={styles.shareButtonText}>문자</CustomText>
              </TouchableOpacity>

              {/* 더 많은 공유 옵션 */}
              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareGeneral}
              >
                <View style={styles.shareButtonIcon}>
                  <FontAwesome6 name="share" size={24} color="#333" />
                </View>
                <CustomText style={styles.shareButtonText}>더보기</CustomText>
              </TouchableOpacity>

              {/* 복사하기 */}
              <TouchableOpacity
                style={styles.shareButton}
                onPress={copyToClipboard}
              >
                <View style={styles.shareButtonIcon}>
                  <FontAwesome6 name="clipboard" size={24} color="#333" />
                </View>
                <CustomText style={styles.shareButtonText}>복사하기</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default InviteMemberModal;
