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
import { flushConfirmModalStyles as styles } from './styles';

interface FlushConfirmModalProps {
  visible: boolean;
  itemCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const FlushConfirmModal: React.FC<FlushConfirmModalProps> = ({
  visible,
  itemCount,
  onConfirm,
  onCancel,
}) => {
  // 애니메이션 로직은 DeleteConfirmationModal과 동일
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 400,
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
                <MaterialIcons name="check" size={48} color="coral" />
              </View>

              {/* 제목 */}
              <Text style={styles.title}>장바구니 비우기</Text>

              {/* 메시지 */}
              <Text style={styles.message}>
                체크된 <Text style={styles.itemCount}>{itemCount}개</Text>의
                아이템을{'\n'}
                삭제하시겠습니까?
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
export default FlushConfirmModal;
