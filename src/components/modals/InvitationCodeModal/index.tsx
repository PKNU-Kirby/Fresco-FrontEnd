// components/modals/InvitationCodeModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';

const { width } = Dimensions.get('window');
const baseWidth = 402;
const scale = (size: number) => (width / baseWidth) * size;

interface InvitationCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const InvitationCodeModal: React.FC<InvitationCodeModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [invitationCode, setInvitationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleConfirm = async () => {
    if (!invitationCode.trim()) {
      setErrorMessage('초대코드를 입력해주세요.');
      return;
    }

    if (!/^\d+$/.test(invitationCode.trim())) {
      setErrorMessage('초대코드는 숫자만 입력 가능합니다.');
      return;
    }

    try {
      await AsyncStorage.setItem(
        'pendingInvitationCode',
        invitationCode.trim(),
      );
      setInvitationCode('');
      setErrorMessage('');
      onConfirm();
    } catch (error) {
      setErrorMessage('초대코드 저장에 실패했습니다.');
    }
  };

  const handleClose = () => {
    setInvitationCode('');
    setErrorMessage('');
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
          {/* 아이콘 */}
          <View style={styles.iconContainer}>
            <Icon name="login" size={scale(48)} color="rgba(47, 72, 88, 1)" />
          </View>

          {/* 제목 */}
          <Text style={styles.title}>초대코드 입력</Text>

          {/* 메시지 */}
          <Text style={styles.message}>
            초대코드를 입력한 후{'\n'}로그인을 진행해주세요
          </Text>

          {/* 입력 필드 */}
          <TextInput
            style={[styles.input, errorMessage ? styles.inputError : null]}
            placeholder="초대코드 (숫자)"
            value={invitationCode}
            onChangeText={text => {
              setInvitationCode(text);
              setErrorMessage('');
            }}
            keyboardType="number-pad"
            maxLength={10}
          />

          {/* 에러 메시지 */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* 버튼 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default InvitationCodeModal;
