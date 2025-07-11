import React, {useState} from 'react';
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import CustomText from '../../common/CustomText';

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
              <CustomText>상태</CustomText>
              <TouchableOpacity
                style={[styles.switch, isHidden && styles.switchActive]}
                onPress={() => setIsHidden(!isHidden)}>
                <CustomText style={styles.switchText}>
                  {isHidden ? '숨기기' : '표시하기'}
                </CustomText>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleAdd} style={styles.button}>
              <CustomText>{editMode ? '수정' : '추가'}</CustomText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose} style={styles.button}>
              <CustomText>취소</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FridgeModalForm;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    padding: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switch: {
    backgroundColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 50,
    alignItems: 'center',
  },
  switchActive: {
    backgroundColor: '#007AFF',
  },
  switchText: {
    color: 'white',
    fontSize: 12,
  },
});
