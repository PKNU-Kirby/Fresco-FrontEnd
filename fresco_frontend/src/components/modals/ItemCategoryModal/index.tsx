import React from 'react';
import {View, Modal, TouchableOpacity, FlatList} from 'react-native';
import CustomText from '../../common/CustomText';
import {styles} from './styles';

type ItemCategoryModalProps = {
  visible: boolean;
  itemCategories: string[];
  activeItemCategory: string;
  onClose: () => void;
  onSelect: (category: string) => void;
  onEditPress?: () => void;
};

const ItemCategoryModal: React.FC<ItemCategoryModalProps> = ({
  visible,
  itemCategories,
  activeItemCategory,
  onClose,
  onSelect,
  onEditPress,
}) => {
  const handleItemCategorySelect = (category: string) => {
    onSelect(category);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <CustomText style={styles.modalTitle}>식재료 유형</CustomText>

          <FlatList
            data={itemCategories}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  activeItemCategory === item && {
                    backgroundColor: 'lightgray',
                  },
                ]}
                onPress={() => handleItemCategorySelect(item)}>
                <CustomText
                  style={[
                    styles.modalItemText,
                    activeItemCategory === item && {fontWeight: 'bold'},
                  ]}>
                  {item}
                </CustomText>
                {activeItemCategory === item && (
                  <CustomText style={styles.checkMark}>✓</CustomText>
                )}
              </TouchableOpacity>
            )}
          />

          <View style={styles.modalButtons}>
            {onEditPress && (
              <TouchableOpacity
                style={styles.editCategoryButton}
                onPress={onEditPress}>
                <CustomText style={styles.editCategoryButtonText}>
                  식재료 유형 편집
                </CustomText>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <CustomText style={styles.closeButtonText}>닫기</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ItemCategoryModal;
