import React from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { FridgeWithRole, FridgePermission } from '../../types/permission';
import { FridgeTile } from './FridgeTile';
import { styles, fridgeTileStyles } from './styles';

interface FridgeListProps {
  fridges: FridgeWithRole[];
  isEditMode: boolean;
  onAddFridge: () => void;
  onEditFridge: (fridge: FridgeWithRole) => void;
  onLeaveFridge: (fridge: FridgeWithRole) => void;
  onToggleHidden: (fridge: FridgeWithRole) => void;
  onJoinWithInviteCode: () => void; // 새로 추가된 prop
  permissions: FridgePermission[];
}

export const FridgeList: React.FC<FridgeListProps> = ({
  fridges,
  isEditMode,
  onAddFridge,
  onEditFridge,
  onLeaveFridge,
  onToggleHidden,
  onJoinWithInviteCode, // 새로 추가된 prop
  // permissions,
}) => {
  const getFridgeTiles = () => {
    const visibleFridges = fridges.filter(f => !f.isHidden);
    const tiles = [...visibleFridges];

    if (isEditMode) {
      // 편집 모드: 냉장고 추가 버튼만 표시
      if (tiles.length % 2 === 0) {
        tiles.push({ id: -1, name: 'TRANSPARENT', isHidden: false } as any);
        tiles.push({ id: -2, name: 'PLUS', isHidden: false } as any);
      } else if (tiles.length % 2 === 1) {
        tiles.push({ id: -1, name: 'PLUS', isHidden: false } as any);
      }
    } else {
      // 일반 모드: 초대코드 참여 카드 추가
      tiles.push({ id: -4, name: 'INVITE_JOIN', isHidden: false } as any);

      // 홀수개면 투명 타일 추가 (원래 로직과 동일)
      if (tiles.length % 2 === 1) {
        tiles.push({ id: -3, name: 'TRANSPARENT', isHidden: false } as any);
      }
    }

    return tiles;
  };

  const renderFridgeItem = ({ item }: { item: FridgeWithRole }) => {
    // 편집 모드 - 투명 플레이스홀더
    if (isEditMode && parseInt(item.id, 10) === -2) {
      return <View style={[fridgeTileStyles.tile, { opacity: 0 }]} />;
    }
    // 편집 모드 - 냉장고 추가 버튼
    else if (isEditMode && parseInt(item.id, 10) === -1) {
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
    }
    // 일반 모드 - 투명 플레이스홀더
    else if (!isEditMode && parseInt(item.id, 10) === -3) {
      return <View style={[fridgeTileStyles.tile, { opacity: 0 }]} />;
    }
    // 일반 모드 - 초대코드 참여 카드
    else if (!isEditMode && parseInt(item.id, 10) === -4) {
      return (
        <View style={fridgeTileStyles.tileContainer}>
          {/* 투명한 타일 크기 래퍼 */}
          <View style={fridgeTileStyles.transparentTile}>
            <View style={fridgeTileStyles.iconContainer}>
              {/* 작은 초대코드 참여 버튼 */}
              <TouchableOpacity
                style={fridgeTileStyles.inviteJoinButton}
                onPress={onJoinWithInviteCode}
              >
                <MaterialIcons name="group-add" size={32} color="#25A325" />
                <Text style={fridgeTileStyles.inviteJoinButtonText}>
                  초대코드로{'\n'}참여하기
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={fridgeTileStyles.fridgeName}>
            {/* 빈 텍스트로 높이만 맞춤 */}{' '}
          </Text>
        </View>
      );
    }
    // 일반 냉장고 타일
    else {
      return (
        <FridgeTile
          fridge={item}
          isEditMode={isEditMode}
          isHidden={false}
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
