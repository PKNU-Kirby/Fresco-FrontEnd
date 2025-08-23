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
import { styles } from './styles';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string | React.ReactNode;
  icon?: {
    name: string;
    color: string;
    size?: number;
  };
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  animationConfig?: {
    tension?: number;
    friction?: number;
    duration?: number;
  };
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  icon = { name: 'help-outline', color: '#666', size: 48 },
  confirmText = '확인',
  cancelText = '취소',
  confirmButtonStyle = 'primary',
  onConfirm,
  onCancel,
  animationConfig = { tension: 150, friction: 8, duration: 200 },
}) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: animationConfig.tension,
        friction: animationConfig.friction,
      }).start();
    } else {
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: animationConfig.duration,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, scaleValue, animationConfig]);

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
              {icon && (
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name={icon.name}
                    size={icon.size || 48}
                    color={icon.color}
                  />
                </View>
              )}

              {/* 제목 */}
              <Text style={styles.title}>{title}</Text>

              {/* 메시지 */}
              <View style={styles.messageContainer}>
                {typeof message === 'string' ? (
                  <Text style={styles.message}>{message}</Text>
                ) : (
                  message
                )}
              </View>

              {/* 버튼들 */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    confirmButtonStyle === 'danger'
                      ? styles.dangerButton
                      : styles.confirmButton,
                  ]}
                  onPress={onConfirm}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      confirmButtonStyle === 'danger'
                        ? styles.dangerButtonText
                        : styles.confirmButtonText,
                    ]}
                  >
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ConfirmModal;
