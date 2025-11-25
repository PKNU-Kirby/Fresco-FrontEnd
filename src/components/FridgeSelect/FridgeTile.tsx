import React, { useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { FridgeWithRole } from '../../types/permission';
import { fridgeTileStyles as styles } from './styles';
import ConfirmModal from '../modals/ConfirmModal';

type RootStackParamList = {
  MainTabs: { fridgeId: number; fridgeName: string };
};

interface FridgeTileProps {
  fridge: FridgeWithRole;
  isEditMode: boolean;
  onEdit?: (fridge: FridgeWithRole) => void;
  onLeave?: (fridge: FridgeWithRole) => void;
  isSmall?: boolean;
}

export const FridgeTile: React.FC<FridgeTileProps> = ({
  fridge,
  isEditMode,
  onEdit,
  onLeave,
  isSmall,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 모달 상태 관리
  const [modals, setModals] = useState({
    editConfirmVisible: false,
    leaveConfirmVisible: false,
    deleteConfirmVisible: false,
  });

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

    // 편집 권한이 있으면 편집 확인 모달
    if ((fridge.isOwner || fridge.canEdit) && onEdit) {
      setModals(prev => ({ ...prev, editConfirmVisible: true }));
    }
    // 아니면 나가기/삭제 확인 모달
    else if (onLeave) {
      const canDelete = fridge.isOwner || fridge.canDelete;
      if (canDelete) {
        setModals(prev => ({ ...prev, deleteConfirmVisible: true }));
      } else {
        setModals(prev => ({ ...prev, leaveConfirmVisible: true }));
      }
    }
  };
  // 🔍 디버깅 로그 추가
  /*
  console.log('🔍 [FridgeTile] 냉장고 정보:', {
    id: fridge.id,
    name: fridge.name,
    isOwner: fridge.isOwner,
    canEdit: fridge.canEdit,
    canDelete: fridge.canDelete,
    role: fridge.role,
  });
*/
  const canEditFridge = fridge.canEdit ?? fridge.isOwner;
  const canDeleteFridge = fridge.canDelete ?? fridge.isOwner;

  /*
  console.log('🔍 [FridgeTile] 계산된 권한:', {
    canEditFridge,
    canDeleteFridge,
    onEdit존재: !!onEdit,
  });
  */
  const containerStyle = [
    styles.tileContainer,
    isEditMode && styles.editModeContainer,
  ].filter(Boolean);

  const tileStyle = [
    isSmall ? styles.smallTile : styles.tile,
    isEditMode && styles.editModeTile,
  ].filter(Boolean);

  const getIconColor = () => {
    if (isEditMode) return '#777';
    return '#999';
  };

  // 표시할 버튼 리스트 생성
  const renderQuickActions = () => {
    const buttons = [];

    // Button 1 : 수정하기 버튼
    const canEdit = canEditFridge && onEdit;
    buttons.push(
      <TouchableOpacity
        key="edit"
        style={[
          styles.quickActionButton,
          !canEdit && styles.quickActionButtonDisabled,
          { backgroundColor: canEdit ? 'limegreen' : '#ccc' },
        ]}
        onPress={() => {
          if (canEdit) {
            // console.log('퀵 편집 버튼 클릭');
            onEdit(fridge);
          }
        }}
        disabled={!canEdit}
        accessible={true}
        accessibilityLabel={canEdit ? '냉장고 편집하기' : '편집 권한 없음'}
      >
        <FontAwesome5
          name="edit"
          size={16}
          color={canEdit ? '#f8f8f8' : '#999'}
        />
      </TouchableOpacity>,
    );

    // Button 2 : 나가기/삭제 버튼
    if (onLeave) {
      const canDelete = canDeleteFridge;
      buttons.push(
        <TouchableOpacity
          key="leave"
          style={[styles.quickActionButton, { backgroundColor: '#FF6B6B' }]}
          onPress={() => {
            // 삭제 또는 나가기 모달 표시
            if (canDelete) {
              setModals(prev => ({ ...prev, deleteConfirmVisible: true }));
            } else {
              setModals(prev => ({ ...prev, leaveConfirmVisible: true }));
            }
          }}
          accessible={true}
          accessibilityLabel={canDelete ? '냉장고 삭제하기' : '냉장고 나가기'}
        >
          <FontAwesome5
            name={canDelete ? 'trash' : 'sign-out-alt'}
            size={16}
            color="#f8f8f8"
          />
        </TouchableOpacity>,
      );
    }

    return buttons;
  };

  const accessibilityState = {
    selected: isEditMode,
  };

  const accessibilityHint = isEditMode
    ? '길게 눌러서 편집 옵션을 확인하세요'
    : '탭하여 냉장고를 열어보세요';

  return (
    <>
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
              {renderQuickActions()}
            </View>
          )}
        </TouchableOpacity>

        {/* 냉장고 이름 */}
        <Text
          style={[
            styles.fridgeName,
            isSmall && styles.smallFridgeName,
            isEditMode && styles.editFridgeName,
          ]}
          numberOfLines={1}
        >
          {fridge.name}
        </Text>
      </View>

      {/* 편집 확인 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={modals.editConfirmVisible}
        title={fridge.name}
        message="냉장고를 편집하시겠습니까?"
        iconContainer={{ backgroundColor: '#e8f5e9' }}
        icon={{ name: 'edit', color: 'rgba(47, 72, 88, 1)', size: 48 }}
        confirmText="편집"
        cancelText="취소"
        confirmButtonStyle="general"
        onConfirm={() => {
          setModals(prev => ({ ...prev, editConfirmVisible: false }));
          if (onEdit) {
            onEdit(fridge);
          }
        }}
        onCancel={() =>
          setModals(prev => ({ ...prev, editConfirmVisible: false }))
        }
      />

      {/* 나가기 확인 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={modals.leaveConfirmVisible}
        title={fridge.name}
        message="정말 이 냉장고에서 나가시겠습니까?"
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'logout', color: '#FF6B6B', size: 48 }}
        confirmText="나가기"
        cancelText="취소"
        confirmButtonStyle="danger"
        onConfirm={() => {
          setModals(prev => ({ ...prev, leaveConfirmVisible: false }));
          if (onLeave) {
            onLeave(fridge);
          }
        }}
        onCancel={() =>
          setModals(prev => ({ ...prev, leaveConfirmVisible: false }))
        }
      />

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={modals.deleteConfirmVisible}
        title={fridge.name}
        message="냉장고를 삭제하시겠습니까? 삭제된 냉장고는 복구할 수 없습니다."
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'delete-forever', color: '#FF6B6B', size: 48 }}
        confirmText="삭제"
        cancelText="취소"
        confirmButtonStyle="danger"
        onConfirm={() => {
          setModals(prev => ({ ...prev, deleteConfirmVisible: false }));
          if (onLeave) {
            onLeave(fridge);
          }
        }}
        onCancel={() =>
          setModals(prev => ({ ...prev, deleteConfirmVisible: false }))
        }
      />
    </>
  );
};
