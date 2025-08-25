import React from 'react';
import { TouchableOpacity, View, Alert, Text } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FridgeWithRole } from '../../services/AsyncStorageService';
import { fridgeTileStyles as styles } from './styles';

type RootStackParamList = {
  MainTabs: { fridgeId: string; fridgeName: string };
};

interface FridgeTileProps {
  fridge: FridgeWithRole;
  isEditMode: boolean;
  onEdit?: (fridge: FridgeWithRole) => void;
  onLeave?: (fridge: FridgeWithRole) => void;
  onToggleHidden?: (fridge: FridgeWithRole) => void;
  isHidden?: boolean;
  isSmall?: boolean;
}

const FridgeTile: React.FC<FridgeTileProps> = ({
  fridge,
  isEditMode,
  onEdit,
  onLeave,
  onToggleHidden,
  isHidden,
  isSmall,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = () => {
    if (isEditMode && onEdit) {
      onEdit(fridge);
    } else if (!isEditMode) {
      navigation.navigate('MainTabs', {
        fridgeId: fridge.id,
        fridgeName: fridge.name,
      });
    }
  };

  const handleLongPress = () => {
    if (!isEditMode) return;

    const options = [];

    // 편집 옵션 (소유자만)
    if (fridge.isOwner && onEdit) {
      options.push({
        text: '편집',
        onPress: () => onEdit(fridge),
      });
    }

    // 숨김/표시 옵션
    if (onToggleHidden) {
      options.push({
        text: fridge.isHidden ? '표시하기' : '숨기기',
        onPress: () => onToggleHidden(fridge),
      });
    }

    // 나가기/삭제 옵션
    if (onLeave) {
      options.push({
        text: fridge.isOwner ? '삭제하기' : '나가기',
        style: 'destructive' as const,
        onPress: () => onLeave(fridge),
      });
    }

    if (options.length > 0) {
      Alert.alert(fridge.name, '어떤 작업을 하시겠습니까?', [
        ...options,
        { text: '취소', style: 'cancel' },
      ]);
    }
  };

  // 스타일 로직
  const containerStyle = [
    styles.tileContainer,
    isHidden && styles.hiddenContainer,
    isEditMode && styles.editModeContainer,
  ].filter(Boolean);

  const tileStyle = [
    isSmall ? styles.smallTile : styles.tile,
    isHidden && styles.hiddenTile,
    isEditMode && styles.editModeTile,
  ].filter(Boolean);

  // 아이콘 색상 (숨김 상태에 따라)
  const getIconColor = () => {
    if (isHidden) return '#666';
    else if (isEditMode) return '#777';
    return '#999';
  };

  const accessibilityState = {
    disabled: isHidden,
    selected: isEditMode,
  };

  const accessibilityHint = isEditMode
    ? '길게 눌러서 편집 옵션을 확인하세요'
    : '탭하여 냉장고를 열어보세요';

  return (
    <View style={containerStyle}>
      {/* 메인 타일 */}
      <TouchableOpacity
        style={tileStyle}
        onPress={handlePress}
        onLongPress={handleLongPress}
        accessible={true}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={accessibilityState}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        {/* 냉장고 아이콘 */}
        <View style={styles.iconContainer}>
          <Icon
            name="kitchen"
            size={isSmall ? 32 : 64}
            color={getIconColor()}
          />
        </View>
        {/* Edit mode : quick action buttons */}
        {isEditMode && (
          <View style={styles.quickActionsContainer}>
            {/* 숨김/표시 토글 버튼 */}
            {onToggleHidden && (
              <TouchableOpacity
                style={[
                  styles.quickActionButton,
                  { backgroundColor: fridge.isHidden ? '#333' : '#666' },
                ]}
                onPress={() => onToggleHidden(fridge)}
                accessible={true}
                accessibilityLabel={
                  fridge.isHidden ? '냉장고 표시하기' : '냉장고 숨기기'
                }
              >
                <FontAwesome5
                  name={fridge.isHidden ? 'eye' : 'eye-slash'}
                  size={16}
                  color="#f8f8f8"
                />
              </TouchableOpacity>
            )}

            {/* 편집 버튼 (소유자만) */}
            {fridge.isOwner && onEdit && (
              <TouchableOpacity
                style={[
                  styles.quickActionButton,
                  { backgroundColor: 'limegreen' },
                ]}
                onPress={() => onEdit(fridge)}
                accessible={true}
                accessibilityLabel="냉장고 편집하기"
              >
                <FontAwesome5 name="edit" size={16} color="#f8f8f8" />
              </TouchableOpacity>
            )}

            {/* 나가기/삭제 버튼 */}
            {onLeave && (
              <TouchableOpacity
                style={[
                  styles.quickActionButton,
                  { backgroundColor: 'tomato' },
                ]}
                onPress={() => onLeave(fridge)}
                accessible={true}
                accessibilityLabel={
                  fridge.isOwner ? '냉장고 삭제하기' : '냉장고 나가기'
                }
              >
                <FontAwesome5
                  name={fridge.isOwner ? 'trash' : 'sign-out-alt'}
                  size={16}
                  color="#f8f8f8"
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* 냉장고 이름*/}
      <Text
        style={[
          styles.fridgeName,
          isSmall && styles.smallFridgeName,
          isHidden && styles.hiddenFridgeName,
          isEditMode && styles.editFridgeName,
        ]}
        numberOfLines={1}
      >
        {fridge.name}
      </Text>
    </View>
  );
};

export default FridgeTile;
