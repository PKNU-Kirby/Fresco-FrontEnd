import React, {useState} from 'react';
import {View, Modal, TouchableOpacity, FlatList, TextInput} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import CustomText from '../../common/CustomText';
import {styles} from './styles';

type StorageTypeModalProps = {
  visible: boolean;
  storageTypes: string[];
  activeStorageType: string;
  onClose: () => void;
  onSelect: (storageType: string) => void;
  onUpdateStorageTypes: (types: string[]) => void;
};

const StorageTypeModal: React.FC<StorageTypeModalProps> = ({
  visible,
  storageTypes,
  activeStorageType,
  onClose,
  onSelect,
  onUpdateStorageTypes,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newStorageName, setNewStorageName] = useState('');

  const handleStorageTypeSelect = (storageType: string) => {
    onSelect(storageType);
    onClose();
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleDeleteStorageType = (storageType: string) => {
    const updatedTypes = storageTypes.filter(item => item !== storageType);
    onUpdateStorageTypes(updatedTypes);

    // 현재 선택된 분류가 삭제되면 첫 번째로 변경
    if (activeStorageType === storageType && updatedTypes.length > 0) {
      onSelect(updatedTypes[0]);
    }
  };

  const handleAddStorageType = () => {
    if (newStorageName.trim()) {
      onUpdateStorageTypes([...storageTypes, newStorageName.trim()]);
      setNewStorageName('');
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
        animationType="fade"
        onRequestClose={handleClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomText style={styles.modalTitle}>보관 분류</CustomText>

            {!isEditMode ? (
              // 일반 모드: 선택만 가능
              <FlatList
                data={storageTypes}
                keyExtractor={(item, index) => index.toString()}
                style={{maxHeight: 300}} // 최대 높이 제한
                showsVerticalScrollIndicator={true}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      activeStorageType === item && {
                        backgroundColor: 'lightgray',
                      },
                    ]}
                    onPress={() => handleStorageTypeSelect(item)}>
                    <CustomText
                      style={[
                        styles.modalItemText,
                        activeStorageType === item && {fontWeight: 'bold'},
                      ]}>
                      {item}
                    </CustomText>
                    {activeStorageType === item && (
                      <CustomText style={styles.checkMark}>✓</CustomText>
                    )}
                  </TouchableOpacity>
                )}
              />
            ) : (
              // 편집 모드: 순서 변경, 삭제 가능
              <DraggableFlatList
                data={storageTypes}
                onDragEnd={({data}) => onUpdateStorageTypes(data)}
                keyExtractor={(item, index) => index.toString()}
                style={{maxHeight: 300}} // 최대 높이 제한
                showsVerticalScrollIndicator={true}
                renderItem={({item, drag, isActive}) => (
                  <View style={styles.editModeItem}>
                    <TouchableOpacity
                      style={styles.dragHandle}
                      onLongPress={drag}
                      disabled={isActive}>
                      <CustomText style={styles.dragHandleText}>≡</CustomText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.editItemContent}>
                      <CustomText style={styles.modalItemText}>
                        {item}
                      </CustomText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDeleteStorageType(item)}>
                      <CustomText style={styles.deleteItemText}>🗑️</CustomText>
                    </TouchableOpacity>
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
                      보관 분류 편집
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
                      + 보관 분류 추가
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

      {/* 보관 분류 추가 모달 */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.addModalContent}>
            <CustomText style={styles.addModalTitle}>보관 분류 추가</CustomText>

            <TextInput
              style={styles.addModalInput}
              placeholder="보관 분류"
              value={newStorageName}
              onChangeText={setNewStorageName}
              autoFocus
            />

            <View style={styles.addModalButtons}>
              <TouchableOpacity
                style={styles.addModalCancelButton}
                onPress={() => {
                  setIsAddModalVisible(false);
                  setNewStorageName('');
                }}>
                <CustomText>취소</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addModalConfirmButton}
                onPress={handleAddStorageType}>
                <CustomText>추가</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default StorageTypeModal;
