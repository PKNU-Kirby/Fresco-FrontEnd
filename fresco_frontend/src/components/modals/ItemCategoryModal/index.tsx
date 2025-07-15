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

type ModalMode = 'select' | 'edit' | 'add';

const ItemCategoryModal: React.FC<ItemCategoryModalProps> = ({
  visible,
  itemCategories,
  activeItemCategory,
  onClose,
  onSelect,
  onUpdateCategories,
}) => {
  const [modalMode, setModalMode] = useState<ModalMode>('select');
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleItemCategorySelect = (category: string) => {
    onSelect(category);
    onClose();
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
      setModalMode('edit'); // 추가 후 편집 모드로 돌아가기
    }
  };

  const handleClose = () => {
    setModalMode('select');
    setNewCategoryName('');
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            modalMode === 'add' && {height: 'auto', minHeight: 200},
          ]}>
          {/* 헤더 */}
          <CustomText style={styles.modalTitle}>
            {modalMode === 'add' ? '식재료 유형 추가' : '식재료 유형'}
          </CustomText>

          {/* 선택 모드 */}
          {modalMode === 'select' && (
            <FlatList
              data={itemCategories}
              keyExtractor={(item, index) => index.toString()}
              style={{maxHeight: 300}}
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
                    <MaterialIcons name="check" size={16} color="#333" />
                  )}
                </TouchableOpacity>
              )}
            />
          )}

          {/* 편집 모드 */}
          {modalMode === 'edit' && (
            <DraggableFlatList
              data={itemCategories}
              onDragEnd={({data}) => onUpdateCategories(data)}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={true}
              renderItem={({item, drag, isActive}) => (
                <View style={styles.editModeItem}>
                  <TouchableOpacity onLongPress={drag} disabled={isActive}>
                    <MaterialIcons name="drag-handle" size={16} color="#333" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.editItemContent}>
                    <CustomText style={styles.modalItemText}>{item}</CustomText>
                  </TouchableOpacity>

                  {item !== '전체' && (
                    <TouchableOpacity
                      onPress={() => handleDeleteCategory(item)}>
                      <FontAwesome5 name="trash" size={16} color="#333" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          )}

          {/* 추가 모드 */}
          {modalMode === 'add' && (
            <View style={styles.addCategorySection}>
              <TextInput
                style={styles.addModalInput}
                placeholder="식재료 유형"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                autoFocus
              />
            </View>
          )}

          {/* 하단 버튼들 */}
          <View style={styles.modalButtons}>
            {modalMode === 'select' && (
              <>
                <TouchableOpacity
                  style={styles.editCategoryButton}
                  onPress={() => setModalMode('edit')}>
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
            )}

            {modalMode === 'edit' && (
              <>
                <TouchableOpacity
                  style={styles.addCategoryButton}
                  onPress={() => setModalMode('add')}>
                  <CustomText style={styles.addCategoryButtonText}>
                    + 식재료 유형 추가
                  </CustomText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => {
                    setModalMode('select');
                    handleClose();
                  }}>
                  <CustomText style={styles.confirmButtonText}>확인</CustomText>
                </TouchableOpacity>
              </>
            )}

            {modalMode === 'add' && (
              <>
                <TouchableOpacity
                  style={styles.addModalCancelButton}
                  onPress={() => {
                    setModalMode('edit');
                    setNewCategoryName('');
                  }}>
                  <CustomText style={styles.addModalButtonTextCancel}>
                    취소
                  </CustomText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addModalConfirmButton}
                  onPress={handleAddCategory}>
                  <CustomText style={styles.addModalButtonTextAdd}>
                    추가
                  </CustomText>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ItemCategoryModal;
