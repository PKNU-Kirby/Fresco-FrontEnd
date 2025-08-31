import React from 'react';
import { View, Modal, TouchableOpacity, Text } from 'react-native';
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
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <Text> </Text>
      <TouchableOpacity
        style={styles.fullScreenOverlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>식재료 추가하기</Text>
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
              <Text style={styles.cancelButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddItemModal;
