import React from 'react';
import { TouchableOpacity, View, Alert, Text } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FridgeWithRole } from '../../types/permission';
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

export const FridgeTile: React.FC<FridgeTileProps> = ({
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
      console.log(
        `냉장고 ${fridge.name} 편집 시도 - isOwner: ${fridge.isOwner}, canEdit: ${fridge.canEdit}`,
      );
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

    console.log(`냉장고 ${fridge.name} 롱프레스 - 권한 체크 시작`);
    console.log(
      'isOwner:',
      fridge.isOwner,
      'canEdit:',
      fridge.canEdit,
      'canDelete:',
      fridge.canDelete,
    );

    const options = [];

    // 편집 옵션 (canEdit 권한도 함께 체크)
    if ((fridge.isOwner || fridge.canEdit) && onEdit) {
      console.log('편집 옵션 추가됨');
      options.push({
        text: '편집',
        onPress: () => {
          console.log('편집 버튼 클릭');
          onEdit(fridge);
        },
      });
    } else {
      console.log(
        '편집 옵션 추가 안됨 - isOwner:',
        fridge.isOwner,
        'canEdit:',
        fridge.canEdit,
        'onEdit:',
        !!onEdit,
      );
    }

    // 숨김/표시 옵션
    if (onToggleHidden) {
      options.push({
        text: fridge.isHidden ? '표시하기' : '숨기기',
        onPress: () => onToggleHidden(fridge),
      });
    }

    // 나가기/삭제 옵션 (canDelete 권한도 함께 체크)
    if (onLeave) {
      const canDelete = fridge.isOwner || fridge.canDelete;
      options.push({
        text: canDelete ? '삭제하기' : '나가기',
        style: 'destructive' as const,
        onPress: () => onLeave(fridge),
      });
    }

    console.log('최종 옵션 개수:', options.length);

    if (options.length > 0) {
      Alert.alert(fridge.name, '어떤 작업을 하시겠습니까?', [
        ...options,
        { text: '취소', style: 'cancel' },
      ]);
    }
  };

  // 편집 버튼 조건 (canEdit 권한 포함)
  const canEditFridge = fridge.isOwner || fridge.canEdit;
  const canDeleteFridge = fridge.isOwner || fridge.canDelete;

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

            {/* 편집 버튼 - 권한 조건 수정 */}
            {canEditFridge && onEdit && (
              <TouchableOpacity
                style={[
                  styles.quickActionButton,
                  { backgroundColor: 'limegreen' },
                ]}
                onPress={() => {
                  console.log('퀵 편집 버튼 클릭');
                  onEdit(fridge);
                }}
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
                  canDeleteFridge ? '냉장고 삭제하기' : '냉장고 나가기'
                }
              >
                <FontAwesome5
                  name={canDeleteFridge ? 'trash' : 'sign-out-alt'}
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
