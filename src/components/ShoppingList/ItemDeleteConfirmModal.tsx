import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { itemDeleteConfirmModalStyles as styles } from './styles';

interface ItemDeleteConfirmModalProps {
  visible: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ItemDeleteConfirmModal: React.FC<ItemDeleteConfirmModalProps> = ({
  visible,
  itemName,
  onConfirm,
  onCancel,
}) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();
    } else {
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, scaleValue]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{ scale: scaleValue }],
                },
              ]}
            >
              {/* 아이콘 */}
              <View style={styles.iconContainer}>
                <MaterialIcons
                  name="delete-outline"
                  size={48}
                  color="#FF6B6B"
                />
              </View>

              {/* 제목 */}
              <Text style={styles.title}>아이템 삭제</Text>

              {/* 메시지 */}
              <Text style={styles.message}>
                <Text style={styles.itemName}>"{itemName}"</Text>을(를){'\n'}
                장바구니에서 삭제하시겠습니까?
              </Text>

              {/* 버튼들 */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={onConfirm}
                  activeOpacity={0.7}
                >
                  <Text style={styles.confirmButtonText}>삭제</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ItemDeleteConfirmModal;
