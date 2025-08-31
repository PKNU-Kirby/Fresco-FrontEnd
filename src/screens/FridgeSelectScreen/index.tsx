import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text, Animated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
//
import { HiddenFridgesBottomSheet } from '../../components/FridgeSelect/HiddenFridgeBottomSheet';
import { FridgeHeader } from '../../components/FridgeSelect/FridgeHeader';
import { FridgeList } from '../../components/FridgeSelect/FridgeTileList';
import { FridgeModals } from '../../components/FridgeSelect/FridgeModal';
import ConfirmModal from '../../components/modals/ConfirmModal';
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
  const {
    handleLogout,
    handleEditFridge,
    handleLeaveFridge,
    handleToggleHidden,
    handleAddFridge,
    handleUpdateFridge,
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
          onLogout={handleLogout}
          onEditToggle={handleEditToggle}
        />

        <FridgeList
          fridges={fridges}
          isEditMode={isEditMode}
          onAddFridge={() => setIsAddModalVisible(true)}
          onEditFridge={handleEditFridge}
          onLeaveFridge={handleLeaveFridge}
          onToggleHidden={handleToggleHidden}
        />

        <HiddenFridgesBottomSheet
          fridges={fridges}
          isEditMode={isEditMode}
          isExpanded={isBottomSheetExpanded}
          bottomSheetHeight={bottomSheetHeight}
          onToggleSheet={toggleBottomSheet}
          onEditFridge={handleEditFridge}
          onLeaveFridge={handleLeaveFridge}
          onToggleHidden={handleToggleHidden}
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
          onAddFridge={handleAddFridge}
          onUpdateFridge={handleUpdateFridge}
        />

        {/* 로그아웃 확인 모달 */}
        <ConfirmModal
          isAlert={true}
          visible={modals.logoutConfirmVisible}
          title="로그아웃"
          message="정말 로그아웃하시겠습니까?"
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="로그아웃"
          cancelText="취소"
          confirmButtonStyle="danger"
          onConfirm={modalHandlers.handleLogoutConfirm}
          onCancel={() => modalHandlers.setLogoutConfirmVisible(false)}
        />

        {/* 냉장고 삭제 확인 모달 */}
        <ConfirmModal
          isAlert={true}
          visible={modals.deleteConfirmVisible}
          title="냉장고 삭제"
          message={`${modals.selectedFridge?.name}을(를) 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`}
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="삭제"
          cancelText="취소"
          confirmButtonStyle="danger"
          onConfirm={modalHandlers.handleDeleteConfirm}
          onCancel={() => modalHandlers.setDeleteConfirmVisible(false)}
        />

        {/* 냉장고 나가기 확인 모달 */}
        <ConfirmModal
          isAlert={true}
          visible={modals.leaveConfirmVisible}
          title="냉장고 나가기"
          message={`${modals.selectedFridge?.name}에서 나가시겠습니까?`}
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="나가기"
          cancelText="취소"
          confirmButtonStyle="danger"
          onConfirm={modalHandlers.handleLeaveConfirm}
          onCancel={() => modalHandlers.setLeaveConfirmVisible(false)}
        />

        {/* 소유자 권한 알림 모달 */}
        <ConfirmModal
          isAlert={false}
          visible={modals.notOwnerModalVisible}
          title="알림"
          message="냉장고 소유자만 편집할 수 있습니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{
            name: 'error-outline',
            color: 'tomato',
            size: 48,
          }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => modalHandlers.setNotOwnerModalVisible(false)}
          onCancel={() => modalHandlers.setNotOwnerModalVisible(false)}
        />

        {/* 성공 알림 모달 */}
        <ConfirmModal
          isAlert={false}
          visible={modals.successModalVisible}
          title={modals.modalTitle}
          message={modals.modalMessage}
          iconContainer={{ backgroundColor: '#d3f0d3' }}
          icon={{
            name: 'check',
            color: 'limegreen',
            size: 48,
          }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => modalHandlers.setSuccessModalVisible(false)}
          onCancel={() => modalHandlers.setSuccessModalVisible(false)}
        />

        {/* 에러 알림 모달 */}
        <ConfirmModal
          isAlert={false}
          visible={modals.errorModalVisible}
          title={modals.modalTitle}
          message={modals.modalMessage}
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => modalHandlers.setErrorModalVisible(false)}
          onCancel={() => modalHandlers.setErrorModalVisible(false)}
        />

        {/* 숨김 토글 성공 모달 */}
        <ConfirmModal
          isAlert={false}
          visible={modals.hideToggleModalVisible}
          title={modals.modalTitle}
          message={modals.modalMessage}
          iconContainer={{ backgroundColor: '#d3f0d3' }}
          icon={{ name: 'check', color: 'limegreen', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => modalHandlers.setHideToggleModalVisible(false)}
          onCancel={() => modalHandlers.setHideToggleModalVisible(false)}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default FridgeSelectScreen;
