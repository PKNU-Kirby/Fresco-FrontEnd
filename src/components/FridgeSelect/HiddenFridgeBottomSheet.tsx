import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Animated } from 'react-native';
import FridgeTile from './FridgeTile';
import { FridgeWithRole } from '../../services/AsyncStorageService';
import { styles, fridgeTileStyles } from './styles';

interface HiddenFridgesBottomSheetProps {
  fridges: FridgeWithRole[];
  isEditMode: boolean;
  isExpanded: boolean;
  bottomSheetHeight: Animated.Value;
  onToggleSheet: () => void;
  onEditFridge: (fridge: FridgeWithRole) => void;
  onLeaveFridge: (fridge: FridgeWithRole) => void;
  onToggleHidden: (fridge: FridgeWithRole) => void;
}

export const HiddenFridgesBottomSheet: React.FC<
  HiddenFridgesBottomSheetProps
> = ({
  fridges,
  isEditMode,
  isExpanded,
  bottomSheetHeight,
  onToggleSheet,
  onEditFridge,
  onLeaveFridge,
  onToggleHidden,
}) => {
  const getHiddenFridgeTiles = () => {
    const hiddenFridges = fridges.filter(f => f.isHidden);
    const tiles = [...hiddenFridges];

    if (tiles.length % 2 === 1) {
      tiles.push({ id: -4, name: 'TRANSPARENT_HIDDEN', isHidden: true } as any);
    }

    return tiles;
  };

  const renderHiddenFridgeItem = ({ item }: { item: FridgeWithRole }) => {
    if (item.id === '-4') {
      return <View style={[fridgeTileStyles.tile, { opacity: 0 }]} />;
    } else {
      return (
        <FridgeTile
          fridge={item}
          isEditMode={isEditMode}
          isHidden={true}
          onEdit={onEditFridge}
          onLeave={onLeaveFridge}
          onToggleHidden={onToggleHidden}
        />
      );
    }
  };

  if (!isEditMode) return null;

  return (
    <Animated.View style={[styles.bottomSheet, { height: bottomSheetHeight }]}>
      <TouchableOpacity
        style={styles.bottomSheetHeader}
        onPress={onToggleSheet}
      >
        <View style={styles.dragHandle} />
        <Text style={styles.bottomSheetTitle}>
          숨긴 냉장고{' '}
          {getHiddenFridgeTiles().filter(f => parseInt(f.id, 10) > 0).length}개
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.bottomSheetContent}>
          <FlatList
            data={getHiddenFridgeTiles()}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'center' }}
            renderItem={renderHiddenFridgeItem}
          />
        </View>
      )}
    </Animated.View>
  );
};
