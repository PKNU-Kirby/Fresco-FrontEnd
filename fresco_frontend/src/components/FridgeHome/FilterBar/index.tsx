import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import CustomText from '../../common/CustomText';
import {styles} from './styles';

type FilterBarProps = {
  activeStorageType: string;
  activeItemCategory: string;
  isListEditMode: boolean;
  onStorageTypePress: () => void;
  onItemCategoryPress: () => void;
  onEditModeToggle: () => void;
};

const FilterBar: React.FC<FilterBarProps> = ({
  activeStorageType,
  activeItemCategory,
  isListEditMode,
  onStorageTypePress,
  onItemCategoryPress,
  onEditModeToggle,
}) => {
  return (
    <View style={styles.tabContainer}>
      {/* 보관 분류 + 식재료 유형 버튼 */}
      <View style={styles.leftTabGroup}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={onStorageTypePress}>
          <CustomText style={styles.filterButtonText}>
            {activeStorageType} ▼
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={onItemCategoryPress}>
          <CustomText style={styles.filterButtonText}>
            {activeItemCategory} ▼
          </CustomText>
        </TouchableOpacity>
      </View>

      <View style={styles.rightTabGroup}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            isListEditMode && styles.actionButtonActive,
          ]}
          onPress={onEditModeToggle}>
          <CustomText
            style={[
              styles.actionButtonText,
              isListEditMode && styles.actionButtonTextActive,
            ]}>
            {isListEditMode ? '완료' : '편집하기'}
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FilterBar;
