import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { infoModalStyles } from './styles';

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ visible, onClose }) => {
  const infoItems = [
    '같은 재료가 여러 개 등록되어있는 경우, 별도로 표시됩니다.',
    '사용할 식재료의 수량을 편하게 조절해 보세요!',
    '보유량을 초과하여 사용할 수 없습니다.',
    '사용한 식재료 수량은 즉시 반영됩니다.',
  ];

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={infoModalStyles.overlay}>
          <TouchableWithoutFeedback>
            <View style={infoModalStyles.modalContainer}>
              {/* 아이콘 */}
              <View style={infoModalStyles.iconContainer}>
                <MaterialIcons name="info-outline" size={48} color="#4CAF50" />
              </View>

              {/* 제목 */}
              <Text style={infoModalStyles.title}>사용 안내</Text>

              {/* 메시지 컨테이너 */}
              <View style={infoModalStyles.messageContainer}>
                <View style={infoModalStyles.infoContainer}>
                  {infoItems.map((text, index) => (
                    <View key={index} style={infoModalStyles.infoItem}>
                      <View style={infoModalStyles.bullet} />
                      <Text style={infoModalStyles.infoText}>{text}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 버튼 */}
              <View style={infoModalStyles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    infoModalStyles.button,
                    infoModalStyles.confirmButton,
                  ]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={infoModalStyles.confirmButtonText}>확인</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default InfoModal;
