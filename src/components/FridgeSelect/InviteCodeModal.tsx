import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const baseWidth = 402;
const scale = (size: number) => (width / baseWidth) * size;

interface InviteCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (inviteCode: string) => void;
}

export const InviteCodeModal: React.FC<InviteCodeModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('오류', '초대코드를 입력해주세요.');
      return;
    }

    // 숫자만 허용
    if (!/^\d+$/.test(inviteCode.trim())) {
      Alert.alert('오류', '초대코드는 숫자만 입력 가능합니다.');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(inviteCode.trim());
      setInviteCode('');
      onClose();
    } catch (error) {
      console.error('초대코드 참여 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setInviteCode('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Icon name="group-add" size={32} color="#25A325" />
            </View>
            <Text style={styles.title}>초대코드로 참여하기</Text>
            <Text style={styles.subtitle}>
              냉장고 주인에게 받은 초대코드를 입력해주세요
            </Text>
          </View>

          {/* 입력 필드 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="초대코드를 입력하세요"
              keyboardType="numeric"
              maxLength={10}
              autoFocus={true}
              editable={!isLoading}
            />
          </View>

          {/* 버튼들 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isLoading || !inviteCode.trim()}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? '참여 중...' : '참여하기'}
              </Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: 'white',
    borderRadius: scale(16),
    width: '85%',
    maxWidth: scale(320),
    paddingVertical: scale(24),
    paddingHorizontal: scale(20),
  },
  header: {
    alignItems: 'center',
    marginBottom: scale(24),
  },
  iconContainer: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: '#f0f9f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(12),
  },
  title: {
    fontSize: scale(20),
    fontWeight: '700',
    color: '#333',
    marginBottom: scale(8),
  },
  subtitle: {
    fontSize: scale(14),
    color: '#666',
    textAlign: 'center',
    lineHeight: scale(20),
  },
  inputContainer: {
    marginBottom: scale(24),
  },
  input: {
    borderWidth: scale(2),
    borderColor: '#25A325',
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    fontSize: scale(16),
    textAlign: 'center',
    letterSpacing: scale(2),
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: scale(12),
  },
  button: {
    flex: 1,
    paddingVertical: scale(12),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#25A325',
  },
  submitButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});
