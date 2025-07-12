import React from 'react';
import {View, Modal, TouchableOpacity} from 'react-native';
import CustomText from '../../common/CustomText';
import {styles} from './styles';

type AddItemModalProps = {
  visible: boolean;
  onClose: () => void;
  onDirectAdd: () => void;
  onCameraAdd: () => void;
};

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
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <CustomText style={styles.modalTitle}>식재료 추가하기</CustomText>
          </View>

          <View style={styles.optionContainer}>
            <TouchableOpacity style={styles.optionButton} onPress={onDirectAdd}>
              <View style={styles.optionIcon}>
                <CustomText style={styles.optionIconText}>✎</CustomText>
              </View>
              <CustomText style={styles.optionText}>직접 추가</CustomText>
              <CustomText style={styles.optionDescription}>
                식재료 정보를 직접 입력합니다
              </CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={onCameraAdd}>
              <View style={styles.optionIcon}>
                <CustomText style={styles.optionIconText}>📷</CustomText>
              </View>
              <CustomText style={styles.optionText}>카메라</CustomText>
              <CustomText style={styles.optionDescription}>
                카메라로 식재료를 촬영합니다
              </CustomText>
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <CustomText style={styles.cancelButtonText}>닫기</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddItemModal;
