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
//
import { HiddenFridgesBottomSheet } from '../../components/FridgeSelect/HiddenFridgeBottomSheet';
import { FridgeHeader } from '../../components/FridgeSelect/FridgeHeader';
import { FridgeList } from '../../components/FridgeSelect/FridgeTileList';
import { FridgeModals } from '../../components/FridgeSelect/FridgeModal';
import { FridgeModalManager } from '../../components/FridgeSelect/FridgeModalManager';
//
import { useFridgeSelect } from '../../hooks/useFridgeSelect';
import { useFridgeActions } from '../../hooks/useFridgeActions';
import { useOptimisticEdit } from '../../hooks/useOptimisticEdit';
import { FridgeWithRole } from '../../services/AsyncStorageService';
import { deleteRefrigerator, updateRefrigerator } from '../../types/api';
import { styles } from './styles';
import { AsyncStorageService } from '../../services/AsyncStorageService';
const FridgeSelectScreen = () => {
  const navigation = useNavigation<any>();

  // 서버 데이터 관리
  const {
    currentUser,
    fridges: serverFridges,
    loading,
    initializeData,
    loadUserFridges,
  } = useFridgeSelect(navigation);

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

  // 화면에 실제로 표시할 냉장고 목록 (편집 모드에 따라 다름)
  const displayFridges = isEditMode ? editableFridges : serverFridges;

  // UI 상태
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingFridge, setEditingFridge] = useState<FridgeWithRole | null>(
    null,
  );
  const [bottomSheetHeight] = useState(new Animated.Value(80));
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);

  // 서버 액션들 (실제 API 호출용)
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

  // 편집 모드 토글 핸들러
  const handleEditToggle = () => {
    if (isEditMode) {
      // 편집 모드 종료 - 변경사항이 있으면 확인
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
      // 편집 모드 시작
      startEdit(serverFridges);
    }
  };

  // 편집 완료 핸들러
  const handleSaveChanges = async () => {
    try {
      await commitChanges(
        // Create
        async (name: string) => {
          const fridgeData = { name };
          await serverAddFridge(fridgeData);
        },
        // Update
        async (id: string, name: string) => {
          await updateRefrigerator(id, { name });
        },
        // Delete
        async (id: string) => {
          await deleteRefrigerator(id);
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

  // 로컬 냉장고 편집 핸들러
  const handleEditFridge = (fridge: FridgeWithRole) => {
    if (!isEditMode) {
      // 일반 모드에서는 상세 화면으로 이동
      return;
    }

    if (!fridge.isOwner) {
      Alert.alert('알림', '냉장고 소유자만 편집할 수 있습니다.');
      return;
    }

    // 편집 모드에서는 이름 변경 프롬프트
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

  // 로컬 냉장고 삭제 핸들러
  const handleLeaveFridge = (fridge: FridgeWithRole) => {
    if (!isEditMode) return;

    const actionText = fridge.isOwner ? '삭제' : '나가기';
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

  // 로컬 냉장고 추가 핸들러
  const handleAddFridge = () => {
    if (!isEditMode) {
      setIsAddModalVisible(true);
      return;
    }

    // 편집 모드에서는 즉시 추가
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

  // Bottom Sheet Toggle Handler
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

  useEffect(() => {
    const checkTokenStatus = async () => {
      const token = await AsyncStorageService.getAuthToken();
      console.log('FridgeSelectScreen 로드 시 토큰:', token);

      if (!token) {
        console.warn('토큰이 없습니다. 로그인 상태를 확인하세요.');
      }
    };

    checkTokenStatus();
    initializeData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (currentUser) {
        loadUserFridges();
      }
    }, [currentUser]),
  );

  if (loading || !currentUser) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>냉장고 목록을 불러오는 중...</Text>
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
        />

        {/* 일반 모드에서의 냉장고 추가/편집 모달 */}
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

        {/* 확인/알림 모달들 */}
        <FridgeModalManager modals={modals} modalHandlers={modalHandlers} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default FridgeSelectScreen;
