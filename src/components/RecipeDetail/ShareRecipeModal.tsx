import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { shareRecipeModalStyles as styles } from './styles';

interface CheckableFridge {
  id: number;
  name: string;
  isChecked: boolean;
}

interface ShareRecipeModalProps {
  visible: boolean;
  fridges: CheckableFridge[];
  onClose: () => void;
  onToggleFridge: (id: number) => void;
  onShareToSelectedFridges: () => void;
}

export const ShareRecipeModal: React.FC<ShareRecipeModalProps> = ({
  visible,
  fridges,
  onClose,
  onToggleFridge,
  onShareToSelectedFridges,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      statusBarTranslucent={true}
      presentationStyle="pageSheet"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleLeft} />
            <Text style={styles.modalTitle}>레시피 공유하기</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalTitleRight}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            레시피를 공유할 모임을 선택해주세요
          </Text>
          <FlatList
            data={fridges}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.checklistItem}
                onPress={() => onToggleFridge(item.id)}
              >
                <Icon
                  name={item.isChecked ? 'check-circle' : 'circle'}
                  size={24}
                  color={item.isChecked ? 'limegreen' : '#d8d8d8'}
                />
                <Text style={styles.checklistText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            style={styles.checklistContainer}
          />

          <TouchableOpacity
            style={styles.modalActionButton}
            onPress={onShareToSelectedFridges}
          >
            <Text style={styles.modalActionButtonText}>공유하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
