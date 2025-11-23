import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  TextInput,
  TextInputProps,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';

interface ConfirmModalProps {
  isAlert?: boolean;
  visible: boolean;
  title: string;
  message: string | React.ReactNode;
  iconContainer?: { backgroundColor: string };
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
  // 👇 추가된 props
  showInput?: boolean;
  inputValue?: string;
  inputPlaceholder?: string;
  onInputChange?: (text: string) => void;
  inputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder'>;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isAlert = true,
  visible,
  title,
  message,
  iconContainer = { backgroundColor: '#FFE5E5' },
  icon = { name: 'help-outline', color: '#666', size: 48 },
  confirmText = '확인',
  cancelText = '취소',
  confirmButtonStyle = 'primary',
  onConfirm,
  onCancel,
  animationConfig = { tension: 150, friction: 8, duration: 200 },
  // Input Modal Props
  showInput = false,
  inputValue = '',
  inputPlaceholder = '냉장고 이름을 입력해 주세요',
  onInputChange,
  inputProps = {},
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
      transparent={true}
      visible={visible}
      animationType="fade"
      statusBarTranslucent={true}
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
                <View style={[styles.iconContainer, iconContainer]}>
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
              {message && (
                <View style={styles.messageContainer}>
                  {typeof message === 'string' ? (
                    <Text style={styles.message}>{message}</Text>
                  ) : (
                    message
                  )}
                </View>
              )}

              {/* Input */}
              {showInput && (
                <TextInput
                  style={styles.input}
                  value={inputValue}
                  onChangeText={onInputChange}
                  placeholder={inputPlaceholder}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={onConfirm}
                  {...inputProps}
                />
              )}

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {isAlert && (
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onCancel}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.button,
                    confirmButtonStyle === 'danger'
                      ? styles.dangerButton
                      : styles.successButton,
                  ]}
                  onPress={onConfirm}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      confirmButtonStyle === 'danger'
                        ? styles.dangerButtonText
                        : styles.successButtonText,
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
