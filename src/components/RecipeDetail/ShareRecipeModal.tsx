import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';

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
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>레시피 공유하기</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modalContent}>
          <Text style={styles.modalSubtitle}>공유할 냉장고를 선택해주세요</Text>

          <FlatList
            data={fridges}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.checklistItem}
                onPress={() => onToggleFridge(item.id)}
              >
                <Icon
                  name={
                    item.isChecked ? 'check-box' : 'check-box-outline-blank'
                  }
                  size={24}
                  color={item.isChecked ? 'limegreen' : '#999'}
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
      </SafeAreaView>
    </Modal>
  );
};
