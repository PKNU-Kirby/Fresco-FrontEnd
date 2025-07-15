import React, {useState} from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CustomText from '../../common/CustomText';
import {styles} from './styles';

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
  onUpdateCategories,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleItemCategorySelect = (category: string) => {
    onSelect(category);
    onClose();
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleDeleteCategory = (category: string) => {
    Alert.alert('', `[${category}] 카테고리를 삭제합니다.`, [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          const updatedCategories = itemCategories.filter(
            item => item !== category,
          );
          onUpdateCategories(updatedCategories);

          // 현재 선택된 카테고리가 삭제되면 첫 번째로 변경
          if (activeItemCategory === category && updatedCategories.length > 0) {
            onSelect(updatedCategories[0]);
          }
        },
      },
    ]);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onUpdateCategories([...itemCategories, newCategoryName.trim()]);
      setNewCategoryName('');
      setIsAddModalVisible(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomText style={styles.modalTitle}>식재료 유형</CustomText>

            {!isEditMode ? (
              // 일반 모드: 선택만 가능
              <FlatList
                data={itemCategories}
                keyExtractor={(item, index) => index.toString()}
                style={{maxHeight: 300}} // 최대 높이 제한
                showsVerticalScrollIndicator={true}
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
            ) : (
              // 편집 모드: 순서 변경, 삭제 가능
              <DraggableFlatList
                data={itemCategories}
                onDragEnd={({data}) => onUpdateCategories(data)}
                keyExtractor={(item, index) => index.toString()}
                style={{maxHeight: 300}} // 최대 높이 제한
                showsVerticalScrollIndicator={true}
                renderItem={({item, drag, isActive}) => (
                  <View style={styles.editModeItem}>
                    <TouchableOpacity
                      style={styles.dragHandle}
                      onLongPress={drag}
                      disabled={isActive}>
                      <MaterialIcons
                        name="drag-handle"
                        size={16}
                        color="#333"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.editItemContent}>
                      <CustomText style={styles.modalItemText}>
                        {item}
                      </CustomText>
                    </TouchableOpacity>

                    {item !== '전체' && ( // '전체'는 삭제 불가
                      <TouchableOpacity
                        onPress={() => handleDeleteCategory(item)}>
                        <FontAwesome5 name="trash" size={16} color="#333" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              />
            )}

            <View style={styles.modalButtons}>
              {!isEditMode ? (
                <>
                  <TouchableOpacity
                    style={styles.editCategoryButton}
                    onPress={handleEditToggle}>
                    <CustomText style={styles.editCategoryButtonText}>
                      식재료 유형 편집
                    </CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}>
                    <CustomText style={styles.closeButtonText}>닫기</CustomText>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.addCategoryButton}
                    onPress={handleOpenAddModal}>
                    <CustomText style={styles.addCategoryButtonText}>
                      + 식재료 유형 추가
                    </CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => {
                      setIsEditMode(false);
                      handleClose();
                    }}>
                    <CustomText style={styles.confirmButtonText}>
                      확인
                    </CustomText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* 식재료 유형 추가 모달 */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.addModalContent}>
            <CustomText style={styles.addModalTitle}>
              식재료 유형 추가
            </CustomText>

            <TextInput
              style={styles.addModalInput}
              placeholder="식재료 유형"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
            />

            <View style={styles.addModalButtons}>
              <TouchableOpacity
                style={styles.addModalCancelButton}
                onPress={() => {
                  setIsAddModalVisible(false);
                  setNewCategoryName('');
                }}>
                <CustomText>취소</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addModalConfirmButton}
                onPress={handleAddCategory}>
                <CustomText>추가</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ItemCategoryModal;
