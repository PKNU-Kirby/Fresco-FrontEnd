import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
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
  isLoading?: boolean;
}

export const ShareRecipeModal: React.FC<ShareRecipeModalProps> = ({
  visible,
  fridges,
  onClose,
  onToggleFridge,
  onShareToSelectedFridges,
  isLoading = false,
}) => {
  const selectedCount = fridges.filter(fridge => fridge.isChecked).length;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>레시피 공유하기</Text>
          </View>

          <Text style={styles.modalSubtitle}>
            레시피를 공유할 냉장고를 선택해주세요
          </Text>

          {fridges.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="inbox" size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                공유 가능한 냉장고가 없습니다
              </Text>
              <Text style={styles.emptySubText}>
                다른 냉장고에 참여하거나 새 냉장고를 만들어보세요
              </Text>
            </View>
          ) : (
            <FlatList
              data={fridges}
              keyExtractor={item => item.id.toString()}
              style={styles.checklistContainer}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={
                    item.isChecked ? styles.checkedItem : styles.checklistItem
                  }
                  onPress={() => onToggleFridge(item.id)}
                  disabled={isLoading}
                >
                  <Icon
                    name={item.isChecked ? 'check-circle' : 'circle'}
                    size={24}
                    color={item.isChecked ? '#2F4858' : '#d8d8d8'}
                  />
                  <Text style={styles.checklistText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          <TouchableOpacity style={styles.modalButtonsContainer}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseButton}
              disabled={isLoading}
            >
              <Text style={styles.modalCloseButtonText}>닫기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalActionButtonContainer,
                (selectedCount === 0 || isLoading) &&
                  styles.modalActionButtonDisabled,
              ]}
              onPress={onShareToSelectedFridges}
              disabled={selectedCount === 0 || isLoading}
            >
              <Text style={styles.modalActionButtonText}>공유하기</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// styles.ts에 추가할 스타일들
export const additionalStyles = {
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalActionButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
