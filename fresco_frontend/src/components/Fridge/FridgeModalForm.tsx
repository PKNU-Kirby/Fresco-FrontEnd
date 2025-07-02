import React from 'react';
import {Modal, TextInput, TouchableOpacity, View} from 'react-native';
import CustomText from '../common/CustomText';
import styles from '../../screens/FridgeSelectScreen/styles';

interface Props {
  visible: boolean;
  title: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const FridgeModalForm = ({
  visible,
  title,
  placeholder,
  value,
  onChangeText,
  onCancel,
  onSubmit,
}: Props) => {
  return (
    <Modal visible={visible} transparent onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <CustomText style={styles.modalTitle}>{title}</CustomText>

          <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            maxLength={10}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={onCancel}>
              <CustomText>취소</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={onSubmit}>
              <CustomText>확인</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FridgeModalForm;
