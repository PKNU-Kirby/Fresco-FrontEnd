// FridgeSelectScreen.tsx - 개선된 버전 사용 예시
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  Text,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// hooks utils import
import { useFridgeSelect } from '../../hooks/useFridgeSelect';
import { useFridgeActions } from '../../hooks/useFridgeActions';
import { useOptimisticEdit } from '../../hooks/useOptimisticEdit';
import { usePermissions } from '../../hooks/usePermissions';
import { FridgeControllerAPI } from '../../services/API/fridgeControllerAPI';

// 기존 컴포넌트들
import { HiddenFridgesBottomSheet } from '../../components/FridgeSelect/HiddenFridgeBottomSheet';
import { FridgeHeader } from '../../components/FridgeSelect/FridgeHeader';
import { FridgeList } from '../../components/FridgeSelect/FridgeTileList';
import { FridgeModals } from '../../components/FridgeSelect/FridgeModal';
import { FridgeModalManager } from '../../components/FridgeSelect/FridgeModalManager';

import { FridgeWithRole } from '../../types/permission';
import { styles } from './styles';

const FridgeSelectScreen = () => {
  const navigation = useNavigation<any>();

  // 서버 데이터 관리
  const {
    currentUser,
    fridges: serverFridges,
    loading,
    // error,
    initializeData,
    loadUserFridges,
    // retryLoad,
  } = useFridgeSelect(navigation);

  // 권한 관리
  const {
    permissions,
    permissionLoading,
    // permissionError,
    hasPermission,
    getPermission,
  } = usePermissions(currentUser);

  // 낙관적 편집 관리
  const {
    isEditMode,
    editableFridges,
    hasChanges,
    startEdit,
    cancelEdit,
    commitChanges,
    addFridgeLocally,
    editFridgeLocally,
    deleteFridgeLocally,
    toggleHiddenLocally,
  } = useOptimisticEdit();

  // 화면에 실제로 표시할 냉장고 목록
  const displayFridges = isEditMode ? editableFridges : serverFridges;

  // UI 상태
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingFridge, setEditingFridge] = useState<FridgeWithRole | null>(
    null,
  );
  const [bottomSheetHeight] = useState(new Animated.Value(80));
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);

  // 서버 액션들
  const {
    handleLogout,
    handleAddFridge: serverAddFridge,
    handleUpdateFridge: serverUpdateFridge,
    modals,
    modalHandlers,
  } = useFridgeActions({
    currentUser,
    loadUserFridges,
    setEditingFridge,
    setIsEditModalVisible,
    setIsAddModalVisible,
    editingFridge,
    navigation,
  });

  // 권한 기반 액션 핸들러들
  const handleEditFridge = (fridge: FridgeWithRole) => {
    if (!isEditMode) {
      // 일반 모드에서는 상세 화면으로 이동
      if (hasPermission(fridge.id, 'view')) {
        navigation.navigate('FridgeDetail', { fridgeId: fridge.id });
      } else {
        Alert.alert('알림', '이 냉장고에 접근할 권한이 없습니다.');
      }
      return;
    }

    // 편집 모드에서는 이름 변경
    if (!hasPermission(fridge.id, 'edit')) {
      Alert.alert('알림', '이 냉장고를 편집할 권한이 없습니다.');
      return;
    }

    Alert.prompt(
      '냉장고 이름 변경',
      '새 이름을 입력하세요',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: newName => {
            if (newName && newName.trim()) {
              editFridgeLocally(fridge.id, newName.trim());
            }
          },
        },
      ],
      'plain-text',
      fridge.name,
    );
  };

  const handleLeaveFridge = (fridge: FridgeWithRole) => {
    if (!isEditMode) return;

    const permission = getPermission(fridge.id);
    if (!permission) {
      Alert.alert('알림', '이 냉장고에 대한 권한이 없습니다.');
      return;
    }

    const isOwner = permission.role === 'OWNER';
    const actionText = isOwner ? '삭제' : '나가기';

    if (isOwner && !hasPermission(fridge.id, 'delete')) {
      Alert.alert('알림', '이 냉장고를 삭제할 권한이 없습니다.');
      return;
    }

    Alert.alert(
      `냉장고 ${actionText}`,
      `${fridge.name}을(를) ${actionText}하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: actionText,
          style: 'destructive',
          onPress: () => deleteFridgeLocally(fridge.id),
        },
      ],
    );
  };

  const handleAddFridge = () => {
    if (!isEditMode) {
      setIsAddModalVisible(true);
      return;
    }

    Alert.prompt(
      '새 냉장고',
      '냉장고 이름을 입력하세요',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '추가',
          onPress: name => {
            if (name && name.trim()) {
              addFridgeLocally(name.trim());
            }
          },
        },
      ],
      'plain-text',
      '',
    );
  };

  // 편집 모드 토글
  const handleEditToggle = () => {
    if (isEditMode) {
      if (hasChanges) {
        Alert.alert(
          '편집 취소',
          '변경사항이 저장되지 않습니다. 정말 취소하시겠습니까?',
          [
            { text: '계속 편집', style: 'cancel' },
            {
              text: '취소',
              style: 'destructive',
              onPress: () => {
                cancelEdit(serverFridges);
                setIsBottomSheetExpanded(false);
                bottomSheetHeight.setValue(80);
              },
            },
          ],
        );
      } else {
        cancelEdit(serverFridges);
        setIsBottomSheetExpanded(false);
        bottomSheetHeight.setValue(80);
      }
    } else {
      startEdit(serverFridges);
    }
  };

  // 편집 완료
  const handleSaveChanges = async () => {
    try {
      await commitChanges(
        // Create - 수정 필요
        async (name: string) => {
          await FridgeControllerAPI.create({ name }); // 새로운 API 사용
        },
        // Update - 수정 필요
        async (id: string, name: string) => {
          await FridgeControllerAPI.update(id, { name }); // 새로운 API 사용
        },
        // Delete - 수정 필요
        async (id: string) => {
          await FridgeControllerAPI.delete(id); // 새로운 API 사용
        },
      );

      // 성공 시 서버 데이터 새로고침
      await loadUserFridges();

      Alert.alert('성공', '모든 변경사항이 저장되었습니다.');
    } catch (error) {
      console.error('변경사항 저장 실패:', error);
      Alert.alert('오류', '변경사항 저장에 실패했습니다.');
    }
  };

  // Bottom Sheet 토글
  const toggleBottomSheet = () => {
    const newExpanded = !isBottomSheetExpanded;
    setIsBottomSheetExpanded(newExpanded);

    bottomSheetHeight.stopAnimation(() => {
      Animated.timing(bottomSheetHeight, {
        toValue: newExpanded ? 750 : 80,
        duration: 500,
        useNativeDriver: false,
      }).start();
    });
  };

  // 초기화
  useEffect(() => {
    initializeData();
  }, []);

  // 화면 포커스 시 새로고침
  useFocusEffect(
    React.useCallback(() => {
      if (currentUser) {
        loadUserFridges();
      }
    }, [currentUser]),
  );

  // 로딩 상태
  if (loading || !currentUser) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>냉장고 목록을 불러오는 중...</Text>
        {permissionLoading && <Text>권한 정보 확인 중...</Text>}
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <FridgeHeader
          currentUser={currentUser}
          isEditMode={isEditMode}
          hasChanges={hasChanges}
          onLogout={handleLogout}
          onEditToggle={handleEditToggle}
          onSaveChanges={handleSaveChanges}
        />

        <FridgeList
          fridges={displayFridges}
          isEditMode={isEditMode}
          onAddFridge={handleAddFridge}
          onEditFridge={handleEditFridge}
          onLeaveFridge={handleLeaveFridge}
          onToggleHidden={toggleHiddenLocally}
          permissions={permissions}
        />

        <HiddenFridgesBottomSheet
          fridges={displayFridges}
          isEditMode={isEditMode}
          isExpanded={isBottomSheetExpanded}
          bottomSheetHeight={bottomSheetHeight}
          onToggleSheet={toggleBottomSheet}
          onEditFridge={handleEditFridge}
          onLeaveFridge={handleLeaveFridge}
          onToggleHidden={toggleHiddenLocally}
          permissions={permissions}
        />

        <FridgeModals
          isAddModalVisible={isAddModalVisible}
          isEditModalVisible={isEditModalVisible}
          editingFridge={editingFridge}
          onCloseAddModal={() => setIsAddModalVisible(false)}
          onCloseEditModal={() => {
            setIsEditModalVisible(false);
            setEditingFridge(null);
          }}
          onAddFridge={serverAddFridge}
          onUpdateFridge={serverUpdateFridge}
        />

        <FridgeModalManager modals={modals} modalHandlers={modalHandlers} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default FridgeSelectScreen;
