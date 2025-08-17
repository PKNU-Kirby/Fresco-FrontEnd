import React from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import CustomText from '../../common/CustomText';
import OptionButton from './OptionButton';
import { modalStyles as styles } from './styles';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onDirectAdd: () => void;
  onCameraAdd: () => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  visible,
  onClose,
  onDirectAdd,
  onCameraAdd,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {' '}
      <TouchableOpacity
        style={styles.fullScreenOverlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <CustomText style={styles.modalTitle}>식재료 추가하기</CustomText>
          </View>

          <View style={styles.optionContainer}>
            <OptionButton
              iconName="pen"
              text="직접 추가"
              onPress={onDirectAdd}
            />
            <OptionButton
              iconName="camera"
              text="카메라"
              onPress={onCameraAdd}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              accessible={true}
              accessibilityLabel="모달 닫기"
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <CustomText style={styles.cancelButtonText}>닫기</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddItemModal;
