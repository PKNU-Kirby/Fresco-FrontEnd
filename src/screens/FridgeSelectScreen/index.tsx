import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text, Animated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
//
import { HiddenFridgesBottomSheet } from './HiddenFridgeBottomSheet';
import { FridgeHeader } from './FridgeTileHeader';
import { FridgeList } from './FridgeTileList';
import { FridgeModals } from './FridgeModal';
//
import { useFridgeSelect } from '../../hooks/useFridgeSelect';
import { useFridgeActions } from '../../hooks/useFridgeActions';
import { FridgeWithRole } from '../../services/AsyncStorageService';
import { styles } from './styles';

const FridgeSelectScreen = () => {
  const navigation = useNavigation<any>();

  // 데이터 관리
  const { currentUser, fridges, loading, initializeData, loadUserFridges } =
    useFridgeSelect(navigation);

  // UI 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingFridge, setEditingFridge] = useState<FridgeWithRole | null>(
    null,
  );
  const [bottomSheetHeight] = useState(new Animated.Value(80));
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);

  // 액션 핸들러들
  const fridgeActions = useFridgeActions({
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
    setIsEditMode(prev => {
      const newEditMode = !prev;
      if (!newEditMode) {
        setIsBottomSheetExpanded(false);
        bottomSheetHeight.setValue(80);
      }
      return newEditMode;
    });
  };

  // 바텀시트 토글 핸들러
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
          onLogout={fridgeActions.handleLogout}
          onEditToggle={handleEditToggle}
        />

        <FridgeList
          fridges={fridges}
          isEditMode={isEditMode}
          onAddFridge={() => setIsAddModalVisible(true)}
          onEditFridge={fridgeActions.handleEditFridge}
          onLeaveFridge={fridgeActions.handleLeaveFridge}
          onToggleHidden={fridgeActions.handleToggleHidden}
        />

        <HiddenFridgesBottomSheet
          fridges={fridges}
          isEditMode={isEditMode}
          isExpanded={isBottomSheetExpanded}
          bottomSheetHeight={bottomSheetHeight}
          onToggleSheet={toggleBottomSheet}
          onEditFridge={fridgeActions.handleEditFridge}
          onLeaveFridge={fridgeActions.handleLeaveFridge}
          onToggleHidden={fridgeActions.handleToggleHidden}
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
          onAddFridge={fridgeActions.handleAddFridge}
          onUpdateFridge={fridgeActions.handleUpdateFridge}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default FridgeSelectScreen;
