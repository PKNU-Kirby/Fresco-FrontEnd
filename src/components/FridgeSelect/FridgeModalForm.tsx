import React, { useState } from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text } from 'react-native';
import { fridgeModalFormStyles as styles } from './styles';

type Fridge = {
  id: number;
  name: string;
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
      };
      onAddFridge(updatedFridge);
    } else {
      const newFridge: Fridge = {
        id: Date.now(), // 임시 ID
        name: trimmedName,
      };
      onAddFridge(newFridge);
    }

    setName('');

    onClose();
  };

  // CLOSE MODAL
  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Modal transparent animationType="fade" statusBarTranslucent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="냉장고 이름"
            style={styles.input}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.buttonRowRight}
              onPress={handleClose}
            >
              <Text style={styles.buttonRowRightText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonRowLeft} onPress={handleAdd}>
              <Text style={styles.buttonRowLeftText}>
                {editMode ? '수정' : '추가'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FridgeModalForm;
