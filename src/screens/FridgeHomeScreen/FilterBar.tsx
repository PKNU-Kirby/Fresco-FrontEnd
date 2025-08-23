import React from 'react';
import { View } from 'react-native';
import FilterDropdownButton from '../../components/common/FilterDropdownButton';
import ActionToggleButton from '../../components/common/ActionToggleButton';
import { filterBarStyles as styles } from './listStyles';

// Filter Bar Component
interface FilterBarProps {
  activeItemCategory: string;
  isListEditMode: boolean;
  onItemCategoryPress: () => void;
  onEditModeToggle: () => void;
  disabled?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  activeItemCategory,
  isListEditMode,
  onItemCategoryPress,
  onEditModeToggle,
  disabled = false,
}) => {
  return (
    <View style={styles.tabContainer}>
      {/* Filter Button Group */}
      <View style={styles.leftTabGroup}>
        <FilterDropdownButton
          label={activeItemCategory}
          onPress={onItemCategoryPress}
          disabled={disabled}
        />
      </View>

      {/* Action Button Group : Edit Button */}
      <View style={styles.rightTabGroup}>
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

export default FilterBar;
