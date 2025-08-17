import React from 'react';
import { View, Modal, TouchableOpacity, Animated } from 'react-native';
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
  const scaleAnimation = React.useRef(new Animated.Value(0)).current;
  const opacityAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnimation, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnimation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none" // 커스텀 애니메이션 사용
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.modalOverlay,
          {
            opacity: opacityAnimation,
            transform: [{ scale: scaleAnimation }],
          },
        ]}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <CustomText style={styles.modalTitle}>식재료 추가하기</CustomText>
          </View>

          <View style={styles.optionContainer}>
            <OptionButton
              iconName="pen"
              text="직접 추가"
              onPress={onDirectAdd}
              iconColor="#3498db"
            />
            <OptionButton
              iconName="camera"
              text="카메라"
              onPress={onCameraAdd}
              iconColor="#e74c3c"
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              accessible={true}
              accessibilityLabel="모달 닫기"
              accessibilityRole="button"
              activeOpacity={0.8}
            >
              <CustomText style={styles.cancelButtonText}>닫기</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default AddItemModal;
