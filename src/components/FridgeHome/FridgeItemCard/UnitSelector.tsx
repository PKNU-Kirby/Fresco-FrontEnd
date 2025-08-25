import React from 'react';
import { View, TouchableOpacity, Modal, Text } from 'react-native';
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
          <Text style={styles.unitModalTitle}>단위 선택</Text>

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
                <Text
                  style={[
                    styles.unitOptionText,
                    selectedUnit === unit && styles.unitOptionTextSelected,
                  ]}
                >
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.unitModalCloseButton}
            onPress={onClose}
          >
            <Text style={styles.unitModalCloseText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default UnitSelector;
