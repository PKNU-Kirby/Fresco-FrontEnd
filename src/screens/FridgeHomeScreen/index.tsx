import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView, View, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { styles } from './styles';

// Components
import FridgeHeader from '../../components/FridgeHome/FridgeHeader';
import FridgeItemList from '../../components/FridgeHome/FridgeItemList';
import ItemCategoryModal from '../../components/modals/ItemCategoryModal';
import AddItemModal from '../../components/modals/AddItemModal';

// Hooks
import { useFridgeData } from '../../hooks/useFridgeData';
import { useModalState } from '../../hooks/useModalState';

// Usage tracking
import { UsageTrackingService } from '../../services/UseageTrackingService';

type Props = {
  route: {
    params: {
      fridgeId: string;
      fridgeName: string;
      shouldRefresh?: boolean;
      newItems?: any[];
      refreshKey?: number;
    };
  };
};

const FridgeHomeScreen = ({ route }: Props) => {
  const { fridgeId, fridgeName, shouldRefresh, newItems, refreshKey } =
    route.params;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // useFridgeData 훅 사용
  const {
    fridgeItems,
    itemCategories,
    loading,
    error,
    setItemCategories,
    deleteItem,
    updateItemQuantity,
    updateItemUnit,
    updateItemExpiryDate,
    // ✅ 새로 추가된 편집 모드용 함수들
    updateItemQuantityLocal,
    updateItemUnitLocal,
    updateItemExpiryDateLocal,
    applyEditChanges,
    refreshData,
    refreshWithCategory,
  } = useFridgeData(fridgeId);

  // 로컬 상태 관리
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeItemCategory, setActiveItemCategory] = useState('전체');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editModeStartState, setEditModeStartState] = useState<any[]>([]);

  // 모달 상태
  const {
    isItemCategoryModalVisible,
    openItemCategoryModal,
    closeItemCategoryModal,
  } = useModalState();
  const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);

  // 필터링된 아이템들
  const filteredItems = fridgeItems.filter(
    item =>
      activeItemCategory === '전체' || item.itemCategory === activeItemCategory,
  );

  // 당겨서 새로고침
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshWithCategory(activeItemCategory);
    } catch (error) {
      console.error('새로고침 실패:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshWithCategory, activeItemCategory]);

  // 화면이 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      refreshWithCategory(activeItemCategory);
    }, [refreshWithCategory, activeItemCategory]),
  );

  // newItems와 refreshKey 처리
  useEffect(() => {
    if (newItems && newItems.length > 0) {
      console.log('새로 추가된 아이템들 감지:', newItems);
      refreshWithCategory(activeItemCategory);
    }
  }, [newItems, refreshKey, refreshWithCategory, activeItemCategory]);

  // shouldRefresh 파라미터 처리
  useEffect(() => {
    if (shouldRefresh) {
      refreshWithCategory(activeItemCategory);
      navigation.setParams({ shouldRefresh: false });
    }
  }, [shouldRefresh, refreshWithCategory, activeItemCategory, navigation]);

  // 카테고리 변경 시 데이터 새로고침
  useEffect(() => {
    refreshWithCategory(activeItemCategory);
  }, [activeItemCategory, refreshWithCategory]);

  // Event handlers
  const handleBackPress = () => {
    navigation.navigate('FridgeSelect');
  };

  const handleSettingsPress = () => {
    navigation.navigate('FridgeSettings', {
      fridgeId,
      fridgeName,
      userRole: 'member',
    });
  };

  const handleAddItem = () => {
    setIsAddItemModalVisible(true);
  };

  const handleDirectAdd = () => {
    setIsAddItemModalVisible(false);
    navigation.navigate('AddItemScreen', {
      fridgeId,
    });
  };

  const handleCameraAdd = () => {
    setIsAddItemModalVisible(false);
    navigation.navigate('CameraScreen', {
      fridgeId,
    });
  };

  // ✅ 수정된 편집 모드 토글
  const handleEditModeToggle = useCallback(async () => {
    if (!isEditMode) {
      console.log('편집 모드 진입');
      setEditModeStartState(JSON.parse(JSON.stringify(fridgeItems)));
      setIsEditMode(true);
    } else {
      console.log('편집 모드 종료 - 변경사항 적용 중...');

      try {
        const changedCount = await applyEditChanges(editModeStartState);

        if (changedCount > 0) {
          console.log(`${changedCount}개 아이템 변경사항 저장 완료`);
          Alert.alert(
            '저장 완료',
            `${changedCount}개 아이템의 변경사항이 저장되었습니다.`,
          );
        } else {
          console.log('변경사항 없음');
        }

        // 최신 데이터 다시 로드
        await refreshWithCategory(activeItemCategory);

        // ✅ 성공했을 때만 편집 모드 종료 및 상태 초기화
        setEditModeStartState([]);
        setIsEditMode(false);
      } catch (error) {
        console.error('편집 모드 종료 중 오류:', error);

        // ✅ 실패하면 서버에서 최신 데이터 다시 불러오기
        await refreshWithCategory(activeItemCategory);

        Alert.alert(
          '오류',
          '일부 항목을 저장할 수 없습니다. 삭제 권한이 없거나 이미 삭제된 항목일 수 있습니다.',
        );

        // ✅ 편집 모드는 종료하되, 실패한 내용 반영
        setEditModeStartState([]);
        setIsEditMode(false);
      }
    }
  }, [
    isEditMode,
    fridgeItems,
    editModeStartState,
    applyEditChanges,
    refreshWithCategory,
    activeItemCategory,
  ]);

  // ✅ 수정된 로컬 상태 변경 핸들러들
  const handleQuantityChange = useCallback(
    async (itemId: string, newQuantity: number) => {
      if (isEditMode) {
        // 편집 모드에서는 로컬 상태만 변경
        console.log(`로컬 수량 변경: ${itemId} -> ${newQuantity}`);
        updateItemQuantityLocal(itemId, newQuantity);
      } else {
        // 일반 모드에서는 즉시 API 호출
        await updateItemQuantity(itemId, newQuantity);
      }
    },
    [isEditMode, updateItemQuantity, updateItemQuantityLocal],
  );

  const handleUnitChange = useCallback(
    async (itemId: string, newUnit: string) => {
      if (isEditMode) {
        // 편집 모드에서는 로컬 상태만 변경
        console.log(`로컬 단위 변경: ${itemId} -> ${newUnit}`);
        updateItemUnitLocal(itemId, newUnit as any);
      } else {
        // 일반 모드에서는 즉시 API 호출
        await updateItemUnit(itemId, newUnit as any);
      }
    },
    [isEditMode, updateItemUnit, updateItemUnitLocal],
  );

  const handleExpiryDateChange = useCallback(
    async (itemId: string, newDate: string) => {
      if (isEditMode) {
        // 편집 모드에서는 로컬 상태만 변경
        console.log(`로컬 날짜 변경: ${itemId} -> ${newDate}`);
        updateItemExpiryDateLocal(itemId, newDate);
      } else {
        // 일반 모드에서는 즉시 API 호출
        await updateItemExpiryDate(itemId, newDate);
      }
    },
    [isEditMode, updateItemExpiryDate, updateItemExpiryDateLocal],
  );

  // 아이템 삭제
  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      try {
        await deleteItem(itemId);
        Alert.alert('삭제 완료', '아이템이 삭제되었습니다.');
      } catch (error) {
        console.error('아이템 삭제 실패:', error);
        Alert.alert('오류', '아이템 삭제에 실패했습니다. 다시 시도해주세요.');
      }
    },
    [deleteItem],
  );

  const handleItemCategorySelect = (category: string) => {
    setActiveItemCategory(category);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <FridgeHeader
        fridgeName={fridgeName}
        onBackPress={handleBackPress}
        onSettingsPress={handleSettingsPress}
      />

      {/* 메인 콘텐츠 영역 */}
      <View style={styles.mainContent}>
        <FridgeItemList
          items={filteredItems}
          isEditMode={isEditMode}
          isLoading={loading}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onAddItem={handleAddItem}
          onQuantityChange={handleQuantityChange}
          onUnitChange={handleUnitChange}
          onExpiryDateChange={handleExpiryDateChange}
          onDeleteItem={handleDeleteItem}
          // FilterBar 관련 props
          activeItemCategory={activeItemCategory}
          onItemCategoryPress={openItemCategoryModal}
          onEditModeToggle={handleEditModeToggle}
          // API 에러 상태
          apiError={error}
          onRetry={() => refreshWithCategory(activeItemCategory)}
        />
      </View>

      {/* 식재료 유형 선택 모달 */}
      <ItemCategoryModal
        visible={isItemCategoryModalVisible}
        itemCategories={itemCategories}
        activeItemCategory={activeItemCategory}
        onClose={closeItemCategoryModal}
        onSelect={handleItemCategorySelect}
        onUpdateCategories={setItemCategories}
      />

      {/* 식재료 추가 방법 선택 모달 */}
      <AddItemModal
        visible={isAddItemModalVisible}
        onClose={() => setIsAddItemModalVisible(false)}
        onDirectAdd={handleDirectAdd}
        onCameraAdd={handleCameraAdd}
      />
    </SafeAreaView>
  );
};

export default FridgeHomeScreen;
