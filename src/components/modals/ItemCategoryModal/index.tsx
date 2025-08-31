import React from 'react';
import { View, Modal, TouchableOpacity, FlatList, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';

type ItemCategoryModalProps = {
  visible: boolean;
  itemCategories: string[];
  activeItemCategory: string;
  onClose: () => void;
  onSelect: (category: string) => void;
  onUpdateCategories: (categories: string[]) => void;
};
const ItemCategoryModal: React.FC<ItemCategoryModalProps> = ({
  visible,
  itemCategories,
  activeItemCategory,
  onClose,
  onSelect,
}) => {
  const handleItemCategorySelect = (category: string) => {
    onSelect(category);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* 선택 모드 */}
          <FlatList
            data={itemCategories}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  activeItemCategory === item && {
                    backgroundColor: 'lightgray',
                  },
                ]}
                onPress={() => handleItemCategorySelect(item)}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    activeItemCategory === item && { fontWeight: 'bold' },
                  ]}
                >
                  {item}
                </Text>
                {activeItemCategory === item && (
                  <MaterialIcons name="check" size={16} color="#333" />
                )}
              </TouchableOpacity>
            )}
          />

          {/* 하단 버튼들 */}
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ItemCategoryModal;
