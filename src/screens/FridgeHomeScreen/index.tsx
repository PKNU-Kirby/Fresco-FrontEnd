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

// Storage utilities
import {
  getFridgeItemsByFridgeId,
  deleteItemFromFridge,
  updateFridgeItem,
  type FridgeItem,
} from '../../utils/fridgeStorage';

// Usage tracking
import { UsageTrackingService } from '../../utils/UseageTrackingService';

type Props = {
  route: {
    params: {
      fridgeId: string;
      fridgeName: string;
      shouldRefresh?: boolean;
    };
  };
};

const FridgeHomeScreen = ({ route }: Props) => {
  const { fridgeId, fridgeName, shouldRefresh } = route.params;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 상태 관리
  const [actualFridgeItems, setActualFridgeItems] = useState<FridgeItem[]>([]);
  const [_isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeItemCategory, setActiveItemCategory] = useState('전체');

  // 편집 모드용 상태
  const [editModeStartState, setEditModeStartState] = useState<FridgeItem[]>(
    [],
  );

  // hooks (필요한 것만 사용)
  const { itemCategories, setItemCategories } = useFridgeData(fridgeId);
  const {
    isItemCategoryModalVisible,
    openItemCategoryModal,
    closeItemCategoryModal,
  } = useModalState();

  const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);

  // 필터링된 아이템들
  const filteredItems = actualFridgeItems.filter(
    item =>
      activeItemCategory === '전체' || item.itemCategory === activeItemCategory,
  );

  // 실제 냉장고 아이템 로드
  const loadActualFridgeItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await getFridgeItemsByFridgeId(fridgeId);
      setActualFridgeItems(items);
      console.log(`냉장고 ${fridgeId}의 실제 아이템들:`, items);
    } catch (error) {
      console.error('냉장고 아이템 로드 실패:', error);
      Alert.alert('오류', '냉장고 아이템을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [fridgeId]);

  // 화면이 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      loadActualFridgeItems();
    }, [loadActualFridgeItems]),
  );

  // shouldRefresh 파라미터가 있을 때 추가 새로고침
  useEffect(() => {
    if (shouldRefresh) {
      loadActualFridgeItems();
      // 파라미터 초기화 (무한 새로고침 방지)
      navigation.setParams({ shouldRefresh: false });
    }
  }, [shouldRefresh, loadActualFridgeItems, navigation]);

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

  // 편집 모드 토글 (완전히 새로 구현)
  const handleEditModeToggle = useCallback(async () => {
    if (!isEditMode) {
      // 편집 모드 진입
      console.log('편집 모드 진입 - 현재 상태 저장');
      setEditModeStartState([...actualFridgeItems]);
      setIsEditMode(true);
    } else {
      // 편집 모드 종료 - 변경사항을 DB에 일괄 적용
      console.log('편집 모드 종료 - 변경사항 일괄 적용 중...');

      const changedItems = actualFridgeItems.filter(currentItem => {
        const originalItem = editModeStartState.find(
          item => item.id === currentItem.id,
        );
        if (!originalItem) return false;

        return (
          originalItem.quantity !== currentItem.quantity ||
          (originalItem.unit || '개') !== (currentItem.unit || '개') ||
          originalItem.expiryDate !== currentItem.expiryDate
        );
      });

      console.log('변경된 아이템들:', changedItems);

      // 변경사항 일괄 DB 업데이트
      for (const changedItem of changedItems) {
        const originalItem = editModeStartState.find(
          item => item.id === changedItem.id,
        );
        if (!originalItem) continue;

        try {
          // DB 업데이트
          await updateFridgeItem(changedItem.id, {
            quantity: changedItem.quantity,
            unit: changedItem.unit,
            expiryDate: changedItem.expiryDate,
          });

          // 사용 기록 생성
          const changes = [];
          if (originalItem.quantity !== changedItem.quantity) {
            changes.push(
              `수량: ${originalItem.quantity} → ${changedItem.quantity}`,
            );
          }
          if ((originalItem.unit || '개') !== (changedItem.unit || '개')) {
            changes.push(
              `단위: ${originalItem.unit || '개'} → ${
                changedItem.unit || '개'
              }`,
            );
          }
          if (originalItem.expiryDate !== changedItem.expiryDate) {
            changes.push(
              `만료일: ${originalItem.expiryDate} → ${changedItem.expiryDate}`,
            );
          }

          if (changes.length > 0) {
            await UsageTrackingService.trackItemModification(
              changedItem.id,
              changedItem.name,
              changedItem.quantity,
              changedItem.unit || '개',
              fridgeId,
              changes.join(', '),
            );
          }
        } catch (error) {
          console.error(`아이템 ${changedItem.name} 업데이트 실패:`, error);
        }
      }

      // DB에서 최신 데이터 다시 로드
      await loadActualFridgeItems();

      // 편집 상태 초기화
      setEditModeStartState([]);
      setIsEditMode(false);
    }
  }, [
    isEditMode,
    actualFridgeItems,
    editModeStartState,
    fridgeId,
    loadActualFridgeItems,
  ]);

  // 핸들러들 - 편집 모드에서는 로컬 상태만 변경, 일반 모드에서는 차단
  const handleQuantityChange = useCallback(
    (itemId: string, newQuantity: string) => {
      if (isEditMode) {
        // 편집 모드: 로컬 상태만 변경
        setActualFridgeItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item,
          ),
        );
      } else {
        // 일반 모드: 편집 모드가 아니면 차단
        console.warn('일반 모드에서는 수량 변경이 불가능합니다.');
      }
    },
    [isEditMode],
  );

  const handleUnitChange = useCallback(
    (itemId: string, newUnit: string) => {
      if (isEditMode) {
        // 편집 모드: 로컬 상태만 변경
        setActualFridgeItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, unit: newUnit } : item,
          ),
        );
      } else {
        console.warn('일반 모드에서는 단위 변경이 불가능합니다.');
      }
    },
    [isEditMode],
  );

  const handleExpiryDateChange = useCallback(
    (itemId: string, newDate: string) => {
      if (isEditMode) {
        // 편집 모드: 로컬 상태만 변경
        setActualFridgeItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, expiryDate: newDate } : item,
          ),
        );
      } else {
        console.warn('일반 모드에서는 만료일 변경이 불가능합니다.');
      }
    },
    [isEditMode],
  );

  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      try {
        const currentItem = actualFridgeItems.find(item => item.id === itemId);

        await deleteItemFromFridge(itemId);

        // 삭제는 즉시 사용 기록 추가
        if (currentItem) {
          await UsageTrackingService.trackItemDeletion(
            itemId,
            currentItem.name,
            currentItem.quantity,
            currentItem.unit || '개',
            fridgeId,
            '완전 소진',
          );
        }

        await loadActualFridgeItems();
      } catch (error) {
        console.error('아이템 삭제 실패:', error);
      }
    },
    [actualFridgeItems, fridgeId, loadActualFridgeItems],
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
          onAddItem={handleAddItem}
          onQuantityChange={handleQuantityChange}
          onUnitChange={handleUnitChange}
          onExpiryDateChange={handleExpiryDateChange}
          onDeleteItem={handleDeleteItem}
          // FilterBar 관련 props
          activeItemCategory={activeItemCategory}
          onItemCategoryPress={openItemCategoryModal}
          onEditModeToggle={handleEditModeToggle}
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
