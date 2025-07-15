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

type StorageTypeModalProps = {
  visible: boolean;
  storageTypes: string[];
  activeStorageType: string;
  onClose: () => void;
  onSelect: (storageType: string) => void;
  onUpdateStorageTypes: (types: string[]) => void;
};

type ModalMode = 'select' | 'edit' | 'add';

const StorageTypeModal: React.FC<StorageTypeModalProps> = ({
  visible,
  storageTypes,
  activeStorageType,
  onClose,
  onSelect,
  onUpdateStorageTypes,
}) => {
  const [modalMode, setModalMode] = useState<ModalMode>('select');
  const [newStorageName, setNewStorageName] = useState('');

  const handleStorageTypeSelect = (storageType: string) => {
    onSelect(storageType);
    onClose();
  };

  const handleDeleteStorageType = (storageType: string) => {
    Alert.alert('', `[${storageType}] 보관 분류를 삭제합니다.`, [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          const updatedTypes = storageTypes.filter(
            item => item !== storageType,
          );
          onUpdateStorageTypes(updatedTypes);

          // 현재 선택된 분류가 삭제되면 첫 번째로 변경
          if (activeStorageType === storageType && updatedTypes.length > 0) {
            onSelect(updatedTypes[0]);
          }
        },
      },
    ]);
  };

  const handleAddStorageType = () => {
    if (newStorageName.trim()) {
      onUpdateStorageTypes([...storageTypes, newStorageName.trim()]);
      setNewStorageName('');
      setModalMode('edit');
    }
  };

  const handleClose = () => {
    setModalMode('select');
    setNewStorageName('');
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
          {/* HEADER */}
          <CustomText style={styles.modalTitle}>
            {modalMode === 'add' ? '보관 분류 추가' : '보관 분류'}
          </CustomText>

          {/* SELECT MODE */}
          {modalMode === 'select' && (
            <FlatList
              data={storageTypes}
              keyExtractor={(item, index) => index.toString()}
              style={{maxHeight: 300}}
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
                    <MaterialIcons name="check" size={16} color="#333" />
                  )}
                </TouchableOpacity>
              )}
            />
          )}

          {modalMode === 'edit' && (
            <DraggableFlatList
              data={storageTypes}
              onDragEnd={({data}) => onUpdateStorageTypes(data)}
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
                      onPress={() => handleDeleteStorageType(item)}>
                      <FontAwesome5 name="trash" size={16} color="#333" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          )}

          {/* ADD MODE */}
          {modalMode === 'add' && (
            <View style={styles.addStorageTypeSection}>
              <TextInput
                style={styles.addModalInput}
                placeholder="식재료 유형"
                value={newStorageName}
                onChangeText={setNewStorageName}
                autoFocus
              />
            </View>
          )}

          {/* 하단 버튼들 */}
          <View style={styles.modalButtons}>
            {modalMode === 'select' && (
              <>
                <TouchableOpacity
                  style={styles.editStorageTypeButton}
                  onPress={() => setModalMode('edit')}>
                  <CustomText style={styles.editStorageTypeButtonText}>
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
                  style={styles.addStorageTypeButton}
                  onPress={() => setModalMode('add')}>
                  <CustomText style={styles.addStorageTypeButtonText}>
                    + 보관 분류 추가
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
                    setNewStorageName('');
                  }}>
                  <CustomText style={styles.addModalButtonTextCancel}>
                    취소
                  </CustomText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addModalConfirmButton}
                  onPress={handleAddStorageType}>
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

export default StorageTypeModal;
