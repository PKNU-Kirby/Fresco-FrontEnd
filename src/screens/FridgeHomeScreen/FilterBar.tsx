import React from 'react';
import { View, StyleSheet } from 'react-native';
import FilterDropdownButton from '../../components/common/FilterDropdownButton';
import ActionToggleButton from '../../components/common/ActionToggleButton';

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

const styles = StyleSheet.create({
  tabContainer: {
    marginTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 20,
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
