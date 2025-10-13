import React from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { FridgeTile } from './FridgeTile';
import { FridgeWithRole, FridgePermission } from '../../types/permission';
import { styles, fridgeTileStyles } from './styles';

interface FridgeListProps {
  fridges: FridgeWithRole[];
  isEditMode: boolean;
  onAddFridge: () => void;
  onEditFridge: (fridge: FridgeWithRole) => void;
  onLeaveFridge: (fridge: FridgeWithRole) => void;
  onToggleHidden: (fridge: FridgeWithRole) => void;
  permissions: FridgePermission[];
}

export const FridgeList: React.FC<FridgeListProps> = ({
  fridges,
  isEditMode,
  onAddFridge,
  onEditFridge,
  onLeaveFridge,
  onToggleHidden,
  // permissions,
}) => {
  const getFridgeTiles = () => {
    const visibleFridges = fridges.filter(f => !f.isHidden);
    const tiles = [...visibleFridges];

    if (isEditMode) {
      if (tiles.length % 2 === 0) {
        tiles.push({ id: -1, name: 'TRANSPARENT' } as any);
        tiles.push({ id: -2, name: 'PLUS' } as any);
      } else if (tiles.length % 2 === 1) {
        tiles.push({ id: -1, name: 'PLUS' } as any);
      }
    } else {
      if (tiles.length % 2 === 1) {
        tiles.push({ id: -3, name: 'TRANSPARENT' } as any);
      }
    }
    return tiles;
  };

  const renderFridgeItem = ({ item }: { item: FridgeWithRole }) => {
    if (isEditMode && item.id === -2) {
      return <View style={[fridgeTileStyles.tile, { opacity: 0 }]} />;
    } else if (isEditMode && item.id === -1) {
      return (
        <View style={fridgeTileStyles.plusTile}>
          <TouchableOpacity
            style={fridgeTileStyles.plusButton}
            onPress={onAddFridge}
          >
            <View style={fridgeTileStyles.plusIcon}>
              <Icon name="plus" size={32} color="#f8f8f8" />
            </View>
          </TouchableOpacity>
        </View>
      );
    } else if (!isEditMode && item.id === -3) {
      return <View style={[fridgeTileStyles.tile, { opacity: 0 }]} />;
    } else {
      return (
        <FridgeTile
          fridge={item}
          isEditMode={isEditMode}
          onEdit={isEditMode ? onEditFridge : undefined}
          onLeave={isEditMode ? onLeaveFridge : undefined}
          onToggleHidden={isEditMode ? onToggleHidden : undefined}
        />
      );
    }
  };

  return (
    <View style={styles.fridgeTilesListContainer}>
      <FlatList
        data={getFridgeTiles()}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={{ justifyContent: 'center' }}
        renderItem={renderFridgeItem}
      />
    </View>
  );
};
