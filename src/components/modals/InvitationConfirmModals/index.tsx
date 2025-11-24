// components/modals/InvitationConfirmModal.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const baseWidth = 402;
const scale = (size: number) => (width / baseWidth) * size;

interface InvitationInfo {
  refrigeratorName: string;
  inviterName: string;
}

interface InvitationConfirmModalProps {
  visible: boolean;
  isLoading: boolean;
  invitationInfo: {
    refrigeratorName: string;
    inviterName: string;
  } | null;
  onConfirm: () => void; // fridgeId 파라미터 제거
  onCancel: () => void;
}

const InvitationConfirmModal: React.FC<InvitationConfirmModalProps> = ({
  visible,
  isLoading,
  invitationInfo,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {isLoading ? (
            <>
              <ActivityIndicator size="large" color="rgba(47, 72, 88, 1)" />
              <Text style={styles.loadingText}>
                초대 정보를 조회중입니다...
              </Text>
            </>
          ) : invitationInfo ? (
            <>
              {/* 아이콘 */}
              <View style={styles.iconContainer}>
                <Icon
                  name="kitchen"
                  size={scale(48)}
                  color="rgba(47, 72, 88, 1)"
                />
              </View>

              {/* 제목 */}
              <Text style={styles.title}>초대 정보 확인</Text>

              {/* 냉장고 정보 */}
              <View style={styles.infoContainer}>
                <Text style={styles.infoLabel}>냉장고 이름</Text>
                <Text style={styles.infoValue}>
                  {invitationInfo.refrigeratorName}
                </Text>

                <Text style={[styles.infoLabel, { marginTop: scale(16) }]}>
                  초대한 사람
                </Text>
                <Text style={styles.infoValue}>
                  {invitationInfo.inviterName}
                </Text>
              </View>

              {/* 메시지 */}
              <Text style={styles.message}>이 냉장고에 참여하시겠습니까?</Text>

              {/* 버튼 */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={onConfirm}
                >
                  <Text style={styles.confirmButtonText}>참여하기</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: scale(16),
    padding: scale(24),
    alignItems: 'center',
  },
  iconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  title: {
    fontSize: scale(20),
    fontWeight: '700',
    color: '#333',
    marginBottom: scale(8),
  },
  loadingText: {
    fontSize: scale(14),
    color: '#666',
    marginTop: scale(16),
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: scale(8),
    padding: scale(16),
    marginVertical: scale(16),
  },
  infoLabel: {
    fontSize: scale(12),
    color: '#999',
    marginBottom: scale(4),
  },
  infoValue: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
  },
  message: {
    fontSize: scale(14),
    color: '#666',
    textAlign: 'center',
    marginBottom: scale(24),
    lineHeight: scale(20),
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(12),
  },
  button: {
    flex: 1,
    height: scale(48),
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: 'rgba(47, 72, 88, 1)',
  },
  cancelButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#fff',
  },
});

export default InvitationConfirmModal;
