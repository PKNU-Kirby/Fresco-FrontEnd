import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ingredientInfoModalStyles as styles } from './styles';

interface IngredientInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const IngredientInfoModal: React.FC<IngredientInfoModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>재료 상태 안내</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.legendItem}>
              <Icon name={'check-circle'} size={24} color={'limegreen'} />
              <Text style={styles.legendText}>보유 중인 식재료</Text>
            </View>
            <View style={styles.legendItem}>
              <Icon name={'check-circle'} size={24} color={'#fdb526'} />
              <Text style={styles.legendText}>대체 가능한 식재료</Text>
            </View>
            <View style={styles.legendItem}>
              <Icon name={'cancel'} size={24} color={'tomato'} />
              <Text style={styles.legendText}>보유하지 않은 식재료</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
