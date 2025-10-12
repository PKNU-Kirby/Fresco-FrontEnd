import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Text } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { quantityStyles as styles } from './styles';

interface QuantityEditorProps {
  quantity: number;
  unit: string;
  onQuantityChange: (quantity: number) => void;
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
  const [isEditing, setIsEditing] = useState(false);

  // 수량 포맷 함수: 정수면 소수점 없이, 소수면 둘째자리까지
  const formatQuantity = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0';

    // 정수인지 확인 (소수점이 .00인 경우도 정수로 취급)
    if (numValue % 1 === 0) {
      return Math.round(numValue).toString();
    } else {
      return numValue.toFixed(2);
    }
  };

  const handleIncrement = () => {
    const currentNum = quantity || 0;
    const newValue = currentNum + 1;
    onQuantityChange(newValue);
  };

  const handleDecrement = () => {
    const currentNum = quantity || 0;
    const newValue = Math.max(0, currentNum - 1);
    onQuantityChange(newValue);
  };

  const handleTextChange = (text: string) => {
    // 숫자와 소수점 허용
    const numericText = text.replace(/[^0-9.]/g, '');
    onQuantityChange(numericText);
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onTextBlur();
  };

  // 표시용 수량: 편집 중이면 원본값, 아니면 포맷팅된 값
  const displayValue = isEditing ? quantity : formatQuantity(quantity);

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
        value={String(displayValue)}
        onChangeText={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType="decimal-pad"
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
