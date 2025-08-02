import React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import CustomText from '../../../components/common/CustomText';
import { modalStyles as styles } from './styles';

interface UnitSelectorProps {
  visible: boolean;
  selectedUnit: string;
  options: string[];
  onSelect: (unit: string) => void;
  onClose: () => void;
}

const UnitSelector: React.FC<UnitSelectorProps> = ({
  visible,
  selectedUnit,
  options,
  onSelect,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.unitModalOverlay}>
        <View style={styles.unitModalContent}>
          <CustomText style={styles.unitModalTitle}>단위 선택</CustomText>

          <View style={styles.unitOptionsContainer}>
            {options.map(unit => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitOption,
                  selectedUnit === unit && styles.unitOptionSelected,
                ]}
                onPress={() => onSelect(unit)}
              >
                <CustomText
                  style={[
                    styles.unitOptionText,
                    selectedUnit === unit && styles.unitOptionTextSelected,
                  ]}
                >
                  {unit}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.unitModalCloseButton}
            onPress={onClose}
          >
            <CustomText style={styles.unitModalCloseText}>닫기</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default UnitSelector;
