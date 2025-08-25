import React from 'react';
import { View, TouchableOpacity, TextInput, Text } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { quantityStyles as styles } from './styles';

interface QuantityEditorProps {
  quantity: string;
  unit: string;
  onQuantityChange: (quantity: string) => void; // 하나로 통일
  onTextBlur: () => void;
  onUnitPress: () => void;
}

const QuantityEditor: React.FC<QuantityEditorProps> = ({
  quantity,
  unit,
  onQuantityChange,
  onTextBlur,
  onUnitPress,
}) => {
  const handleIncrement = () => {
    const currentNum = parseInt(quantity, 10) || 0;
    onQuantityChange((currentNum + 1).toString());
  };

  const handleDecrement = () => {
    const currentNum = parseInt(quantity, 10) || 0;
    onQuantityChange(Math.max(0, currentNum - 1).toString());
  };

  const handleTextChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    onQuantityChange(numericText);
  };
  return (
    <View style={styles.quantityEditContainer}>
      <TouchableOpacity
        style={styles.quantityButton}
        activeOpacity={1}
        onPress={handleDecrement}
      >
        <FontAwesome6 name="circle-minus" size={25} color="#666" />
      </TouchableOpacity>

      <TextInput
        style={styles.quantityInput}
        value={quantity}
        onChangeText={handleTextChange}
        onBlur={onTextBlur}
        keyboardType="numeric"
        selectTextOnFocus
      />

      <TouchableOpacity style={styles.unitSelector} onPress={onUnitPress}>
        <Text style={styles.quantityUnit}>{unit}</Text>
        <Text style={styles.unitDropdownIcon}>▼</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.quantityButton}
        activeOpacity={1}
        onPress={handleIncrement}
      >
        <FontAwesome6 name="circle-plus" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );
};

export default QuantityEditor;
