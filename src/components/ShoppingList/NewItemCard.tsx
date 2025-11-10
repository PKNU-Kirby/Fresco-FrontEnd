import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import UnitSelector from '../FridgeHome/FridgeItemCard/UnitSelector';
import QuantityEditor from '../FridgeHome/FridgeItemCard/QuantityEditor';
import { newItemCardStyles as styles } from './styles';

const UNITS = ['개', 'kg', 'g', 'L', 'ml'];

interface NewItemCardProps {
  onSave: (name: string, quantity: number, unit: string) => void;
  onCancel: () => void;
}

const NewItemCard: React.FC<NewItemCardProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('개');
  const [showUnitModal, setShowUnitModal] = useState(false);

  // ✅ ref 추가
  const nameInputRef = useRef<TextInput>(null);

  // ✅ 마운트 시 자동 포커스
  useEffect(() => {
    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    if (!name.trim()) {
      return;
    }
    const qty = quantity;
    onSave(name, qty, unit);
  };

  const handleUnitSelect = (selectedUnit: string) => {
    setUnit(selectedUnit);
    setShowUnitModal(false);
  };

  return (
    <>
      <View style={[styles.itemCard, styles.newItemCard]}>
        <View style={styles.itemInfo}>
          {/* Input : name */}
          <TextInput
            ref={nameInputRef} // ✅ ref 연결
            style={styles.nameInput}
            placeholder="식재료 이름 입력"
            value={name}
            onChangeText={setName}
            returnKeyType="next"
          />
          <View style={styles.itemDetails}>
            {/* Input : Quantity */}
            <QuantityEditor
              quantity={quantity}
              unit={unit}
              onQuantityChange={setQuantity}
              onTextBlur={() => {}}
              onUnitPress={() => setShowUnitModal(true)}
            />
            {/* Input : Unit */}
            <UnitSelector
              visible={showUnitModal}
              selectedUnit={unit}
              options={UNITS}
              onSelect={handleUnitSelect}
              onClose={() => setShowUnitModal(false)}
            />
          </View>
        </View>
        {/* Buttons : Cancel - Save */}
        <View style={styles.newItemActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <MaterialIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <MaterialIcons name="check" size={20} color="#41aa45" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default NewItemCard;
