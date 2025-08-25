import React from 'react';
import { View } from 'react-native';
import ActionToggleButton from '../_common/ActionToggleButton';
import { buttonsStyles as styles } from './styles';

interface ShoppingListButtonsProps {
  isListEditMode: boolean;
  onEditModeToggle: () => void;
  onClearCheckedItems: () => void;
  hasCheckedItems: boolean;
  disabled?: boolean;
}

const Buttons: React.FC<ShoppingListButtonsProps> = ({
  isListEditMode,
  onEditModeToggle,
  onClearCheckedItems,
  hasCheckedItems,
  disabled = false,
}) => {
  return (
    <View style={styles.buttonContainer}>
      {/* Left: Clear Button */}
      <View style={styles.leftButtonGroup}>
        <ActionToggleButton
          isActive={hasCheckedItems}
          onPress={onClearCheckedItems}
          activeText="비우기"
          inactiveText="비우기"
          disabled={disabled || !hasCheckedItems}
        />
      </View>

      {/* Right: Edit Button */}
      <View style={styles.rightButtonGroup}>
        <ActionToggleButton
          isActive={isListEditMode}
          onPress={onEditModeToggle}
          activeText="완료"
          inactiveText="편집하기"
          disabled={disabled}
        />
      </View>
    </View>
  );
};

export default Buttons;
