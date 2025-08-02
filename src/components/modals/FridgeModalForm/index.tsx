import React, { useState } from 'react';
import { Modal, View, TextInput, TouchableOpacity } from 'react-native';
import CustomText from '../../common/CustomText';
import { styles } from './styles';

type Fridge = {
  id: number;
  name: string;
  isHidden: boolean;
};

type Props = {
  onClose: () => void;
  onAddFridge: (fridge: Fridge) => void;
  editMode?: boolean;
  initialFridge?: Fridge;
};

const FridgeModalForm = ({
  onClose,
  onAddFridge,
  editMode = false,
  initialFridge,
}: Props) => {
  const [name, setName] = useState(initialFridge?.name || '');
  const [isHidden, setIsHidden] = useState(initialFridge?.isHidden || false);

  // MODAL : ADD & EDIT FRIDGE
  const handleAdd = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    if (editMode && initialFridge) {
      const updatedFridge: Fridge = {
        ...initialFridge,
        name: trimmedName,
        isHidden: isHidden,
      };
      onAddFridge(updatedFridge);
    } else {
      const newFridge: Fridge = {
        id: Date.now(), // 임시 ID
        name: trimmedName,
        isHidden: false,
      };
      onAddFridge(newFridge);
    }

    setName('');
    setIsHidden(false);
    onClose();
  };

  // CLOSE MODAL
  const handleClose = () => {
    setName('');
    setIsHidden(false);
    onClose();
  };

  return (
    <Modal transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="냉장고 이름"
            style={styles.input}
          />

          {editMode && (
            <View style={styles.switchContainer}>
              <CustomText style={styles.switchContainerText}>
                냉장고 상태
              </CustomText>
              <TouchableOpacity
                style={[styles.switch, isHidden && styles.switchActive]}
                onPress={() => setIsHidden(!isHidden)}
              >
                <CustomText style={styles.switchText}>
                  {isHidden ? '숨기기' : '표시하기'}
                </CustomText>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.buttonRowRight}
              onPress={handleClose}
            >
              <CustomText style={styles.buttonRowRightText}>취소</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonRowLeft} onPress={handleAdd}>
              <CustomText style={styles.buttonRowLeftText}>
                {editMode ? '수정' : '추가'}
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FridgeModalForm;
