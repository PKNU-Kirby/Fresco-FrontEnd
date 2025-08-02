import React from 'react';
import { View, StyleSheet } from 'react-native';
import FilterDropdownButton from '../../components/common/FilterDropdownButton';
import ActionToggleButton from '../../components/common/ActionToggleButton';

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

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 56,
  },
  leftTabGroup: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  rightTabGroup: {
    flexDirection: 'row',
    gap: 8,
  },
});
