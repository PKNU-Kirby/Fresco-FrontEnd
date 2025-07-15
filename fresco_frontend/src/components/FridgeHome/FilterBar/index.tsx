import React from 'react';
import {View} from 'react-native';
import FilterDropdownButton from '../../common/FilterDropdownButton';
import ActionToggleButton from '../../common/ActionToggleButton';
import {styles} from './styles';

// Filter Bar Component
interface FilterBarProps {
  activeStorageType: string;
  activeItemCategory: string;
  isListEditMode: boolean;
  onStorageTypePress: () => void;
  onItemCategoryPress: () => void;
  onEditModeToggle: () => void;
  disabled?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  activeStorageType,
  activeItemCategory,
  isListEditMode,
  onStorageTypePress,
  onItemCategoryPress,
  onEditModeToggle,
  disabled = false,
}) => {
  return (
    <View style={styles.tabContainer}>
      {/* Filter Button Group */}
      <View style={styles.leftTabGroup}>
        <FilterDropdownButton
          label={activeStorageType}
          onPress={onStorageTypePress}
          disabled={disabled}
        />
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
