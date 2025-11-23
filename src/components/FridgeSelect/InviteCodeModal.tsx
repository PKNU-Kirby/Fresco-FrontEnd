import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ConfirmModal from '../modals/ConfirmModal';
import { inviteCodeModalStyles as styles } from './styles';

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

  // ConfirmModal 상태들
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showError = (message: string) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!inviteCode.trim()) {
      showError('초대코드를 입력해주세요.');
      return;
    }

    // 숫자만 허용
    if (!/^\d+$/.test(inviteCode.trim())) {
      showError('초대코드는 숫자만 입력 가능합니다.');
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
    <>
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
    </>
  );
};
