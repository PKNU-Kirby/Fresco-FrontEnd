import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { RootStackParamList } from '../../../App';
import { AsyncStorageService } from '../../services/AsyncStorageService';
import ConfirmModal from '../../components/modals/ConfirmModal';
type InviteConfirmRouteProp = RouteProp<RootStackParamList, 'InviteConfirm'>;

const InviteConfirmScreen = (): React.JSX.Element => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<InviteConfirmRouteProp>();
  const { token, fridgeInfo } = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal 상태 관리
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAcceptInvite = async () => {
    setIsProcessing(true);

    try {
      // TODO: 백엔드 API 호출로 대체
      // const response = await InviteService.acceptInvite(token);

      // 임시로 AsyncStorage 사용
      const result = await AsyncStorageService.joinFridgeByCode(token);

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        setErrorMessage(result.message);
        setShowErrorModal(true);
      }
    } catch (error) {
      // console.error('초대 수락 실패:', error);
      setErrorMessage('초대 수락 중 문제가 발생했습니다.');
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'FridgeSelect' }],
    });
  };

  const handleDeclineInvite = () => {
    setShowDeclineModal(true);
  };

  const handleConfirmDecline = () => {
    setShowDeclineModal(false);
    // TODO: 백엔드에 거절 알림
    navigation.reset({
      index: 0,
      routes: [{ name: 'FridgeSelect' }],
    });
  };

  const handleCancelDecline = () => {
    setShowDeclineModal(false);
  };

  const handleErrorConfirm = () => {
    setShowErrorModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="envelope-open" size={48} color="limegreen" />
          </View>
          <Text style={styles.title}>냉장고 초대</Text>
          <Text style={styles.subtitle}>초대를 받았습니다!</Text>
        </View>

        {/* 초대 정보 */}
        <View style={styles.inviteCard}>
          <View style={styles.fridgeIcon}>
            <FontAwesome5 name="home" size={32} color="limegreen" />
          </View>

          <Text style={styles.fridgeName}>{fridgeInfo.name}</Text>
          <Text style={styles.inviterText}>
            <Text style={styles.inviterName}>{fridgeInfo.inviterName}</Text>님이
            초대했습니다
          </Text>

          <View style={styles.memberInfo}>
            <FontAwesome5 name="users" size={16} color="#666" />
            <Text style={styles.memberCount}>
              멤버 {fridgeInfo.memberCount || 1}명
            </Text>
          </View>
        </View>

        {/* 액션 버튼들 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.acceptButton, isProcessing && styles.disabledButton]}
            onPress={handleAcceptInvite}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <FontAwesome5 name="check" size={16} color="#fff" />
                <Text style={styles.acceptButtonText}>참여하기</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.declineButton}
            onPress={handleDeclineInvite}
            disabled={isProcessing}
          >
            <FontAwesome5 name="times" size={16} color="#666" />
            <Text style={styles.declineButtonText}>거절하기</Text>
          </TouchableOpacity>
        </View>

        {/* 안내 텍스트 */}
        <Text style={styles.helpText}>
          참여하시면 냉장고의 모든 식재료를 함께 관리할 수 있습니다
        </Text>
      </View>

      {/* 참여 완료 모달 */}
      <ConfirmModal
        visible={showSuccessModal}
        title="참여 완료"
        message={`'${fridgeInfo.name}' 냉장고에 참여했습니다!`}
        iconContainer={{ backgroundColor: '#e8f5e9' }}
        icon={{ name: 'check-circle-outline', color: 'limegreen', size: 48 }}
        confirmText="확인"
        confirmButtonStyle="primary"
        onConfirm={handleSuccessConfirm}
        showCancelButton={false}
      />

      {/* 초대 거절 확인 모달 */}
      <ConfirmModal
        visible={showDeclineModal}
        title="초대 거절"
        message="정말로 초대를 거절하시겠습니까?"
        iconContainer={{ backgroundColor: '#e8f5e9' }}
        icon={{
          name: 'alert-circle-outline',
          color: 'rgba(47, 72, 88, 1)',
          size: 48,
        }}
        confirmText="거절"
        cancelText="취소"
        confirmButtonStyle="general"
        onConfirm={handleConfirmDecline}
        onCancel={handleCancelDecline}
      />

      {/* 에러 모달 */}
      <ConfirmModal
        visible={showErrorModal}
        title="오류"
        message={errorMessage}
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'alert-circle-outline', color: '#FF6B6B', size: 48 }}
        confirmText="확인"
        confirmButtonStyle="danger"
        onConfirm={handleErrorConfirm}
        showCancelButton={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inviteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fridgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fridgeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  inviterText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  inviterName: {
    fontWeight: '600',
    color: 'limegreen',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    gap: 16,
    marginBottom: 24,
  },
  acceptButton: {
    flexDirection: 'row',
    backgroundColor: 'limegreen',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  declineButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  declineButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default InviteConfirmScreen;
