import React, { useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Alert,
  Text,
  Button,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
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
import { UsageTrackingService } from '../../services/UseageTrackingService';

// API Service for testing
import { ApiService } from '../../services/apiServices';

type Props = {
  route: {
    params: {
      fridgeId: string;
      fridgeName: string;
      shouldRefresh?: boolean;
    };
  };
};

// API 테스트 컴포넌트 (임시 - 나중에 제거 예정)
type TestResult = {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
} | null;

const ApiTestComponent = ({ fridgeId }: { fridgeId: string }) => {
  const [testResults, setTestResults] = useState<{
    step1: TestResult;
    step2: TestResult;
    step3: TestResult;
  }>({
    step1: null,
    step2: null,
    step3: null,
  });
  const [loading, setLoading] = useState({
    step1: false,
    step2: false,
    step3: false,
  });
  const [searchKeyword, setSearchKeyword] = useState('바나나');
  const [showTests, setShowTests] = useState(false);

  // 1단계: Auto-complete API 테스트
  const testStep1_AutoComplete = async () => {
    setLoading(prev => ({ ...prev, step1: true }));

    try {
      console.log('1단계: Auto-complete API 테스트 시작');
      console.log(`검색 키워드: "${searchKeyword}"`);

      const response = await ApiService.apiCall(
        `/ap1/v1/ingredient/auto-complete?keyword=${encodeURIComponent(
          searchKeyword,
        )}`,
      );

      console.log('1단계 성공 - Auto-complete 응답:', response);

      setTestResults(prev => ({
        ...prev,
        step1: {
          success: true,
          data: response,
          message: `검색 성공: ${response?.length || 0}개 결과`,
        },
      }));

      Alert.alert(
        '1단계 성공',
        `"${searchKeyword}" 검색 결과: ${response?.length || 0}개`,
      );
    } catch (error) {
      console.error('1단계 실패 - Auto-complete 오류:', error);

      setTestResults(prev => ({
        ...prev,
        step1: {
          success: false,
          error: error.message,
          message: '검색 API 호출 실패',
        },
      }));

      Alert.alert('1단계 실패', error.message);
    } finally {
      setLoading(prev => ({ ...prev, step1: false }));
    }
  };

  // 2단계: 단일 아이템 저장 테스트
  const testStep2_SingleSave = async () => {
    setLoading(prev => ({ ...prev, step2: true }));

    try {
      console.log('2단계: 단일 아이템 저장 테스트 시작');

      // 1단계 결과에서 첫 번째 아이템 사용
      if (!testResults.step1?.success || !testResults.step1?.data?.length) {
        throw new Error('1단계를 먼저 성공해야 합니다');
      }

      const firstIngredient = testResults.step1.data[0];
      console.log('저장할 식재료:', firstIngredient);

      const saveRequest = {
        ingredientsInfo: [
          {
            ingredientId: firstIngredient.ingredientId,
            categoryId: firstIngredient.categoryId,
            expirationDate: '2025-09-13', // 테스트용 고정 날짜
          },
        ],
      };

      console.log('저장 요청 데이터:', saveRequest);

      const response = await ApiService.apiCall(
        `/ap1/v1/ingredient/${fridgeId}`,
        {
          method: 'POST',
          body: JSON.stringify(saveRequest),
        },
      );

      console.log('2단계 성공 - 저장 응답:', response);

      setTestResults(prev => ({
        ...prev,
        step2: {
          success: true,
          data: response,
          message: `저장 성공: ${response?.length || 0}개 아이템`,
        },
      }));

      Alert.alert(
        '2단계 성공',
        `"${firstIngredient.ingredientName}" 저장 완료`,
      );
    } catch (error) {
      console.error('2단계 실패 - 저장 오류:', error);

      setTestResults(prev => ({
        ...prev,
        step2: {
          success: false,
          error: error.message,
          message: '저장 API 호출 실패',
        },
      }));

      Alert.alert('2단계 실패', error.message);
    } finally {
      setLoading(prev => ({ ...prev, step2: false }));
    }
  };

  // 3단계: 냉장고 아이템 조회 테스트
  const testStep3_GetItems = async () => {
    setLoading(prev => ({ ...prev, step3: true }));

    try {
      console.log('3단계: 냉장고 아이템 조회 테스트 시작');

      const response = await ApiService.getFridgeItems(fridgeId, {
        categoryIds: [],
        page: 0,
        size: 10,
      });

      console.log('3단계 성공 - 조회 응답:', response);

      setTestResults(prev => ({
        ...prev,
        step3: {
          success: true,
          data: response,
          message: `조회 성공: ${response?.content?.length || 0}개 아이템`,
        },
      }));

      Alert.alert(
        '3단계 성공',
        `냉장고에 ${response?.content?.length || 0}개 아이템 있음`,
      );
    } catch (error) {
      console.error('3단계 실패 - 조회 오류:', error);

      setTestResults(prev => ({
        ...prev,
        step3: {
          success: false,
          error: error.message,
          message: '조회 API 호출 실패',
        },
      }));

      Alert.alert('3단계 실패', error.message);
    } finally {
      setLoading(prev => ({ ...prev, step3: false }));
    }
  };

  const getStatusColor = result => {
    if (!result) return '#999';
    return result.success ? '#4CAF50' : '#F44336';
  };

  const getStatusText = result => {
    if (!result) return '대기';
    return result.success ? '성공' : '실패';
  };

  if (!showTests) {
    return (
      <View style={testStyles.toggleContainer}>
        <Button
          title="🧪 API 테스트 열기"
          onPress={() => setShowTests(true)}
          color="#FF9800"
        />
      </View>
    );
  }

  return (
    <View style={testStyles.container}>
      <View style={testStyles.header}>
        <Text style={testStyles.title}>🧪 API 테스트</Text>
        <Button title="닫기" onPress={() => setShowTests(false)} />
      </View>

      <TextInput
        style={testStyles.input}
        value={searchKeyword}
        onChangeText={setSearchKeyword}
        placeholder="검색 키워드"
      />

      <View style={testStyles.buttons}>
        <Button
          title={loading.step1 ? '테스트 중...' : '1. 검색'}
          onPress={testStep1_AutoComplete}
          disabled={loading.step1}
        />
        <Button
          title={loading.step2 ? '테스트 중...' : '2. 저장'}
          onPress={testStep2_SingleSave}
          disabled={loading.step2 || !testResults.step1?.success}
        />
        <Button
          title={loading.step3 ? '테스트 중...' : '3. 조회'}
          onPress={testStep3_GetItems}
          disabled={loading.step3}
        />
      </View>

      <View style={testStyles.results}>
        {[1, 2, 3].map(step => {
          const result = testResults[`step${step}`];
          return (
            <View key={step} style={testStyles.resultItem}>
              <Text
                style={[testStyles.stepText, { color: getStatusColor(result) }]}
              >
                {step}단계: {getStatusText(result)}
              </Text>
              {result && (
                <Text style={testStyles.resultText}>
                  {result.message}
                  {result.error && ` (${result.error})`}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const FridgeHomeScreen = ({ route }: Props) => {
  const { fridgeId, fridgeName, shouldRefresh } = route.params;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 상태 관리
  const [actualFridgeItems, setActualFridgeItems] = useState<FridgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeItemCategory, setActiveItemCategory] = useState('전체');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 편집 모드용 상태
  const [editModeStartState, setEditModeStartState] = useState<FridgeItem[]>(
    [],
  );

  // API 에러 상태
  const [apiError, setApiError] = useState<string | null>(null);

  // hooks
  const { itemCategories, setItemCategories } = useFridgeData(fridgeId);
  const {
    isItemCategoryModalVisible,
    openItemCategoryModal,
    closeItemCategoryModal,
  } = useModalState();

  const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);

  // 카테고리별 필터링을 위한 카테고리 ID 매핑 (실제 구현에서는 API에서 카테고리 목록을 가져와야 함)
  const getCategoryIds = useCallback((categoryName: string): number[] => {
    if (categoryName === '전체') return [];

    // 실제로는 카테고리 이름을 ID로 변환하는 로직이 필요
    // 지금은 임시로 하드코딩
    const categoryMap: { [key: string]: number } = {
      베이커리: 1,
      '채소 / 과일': 2,
      '정육 / 계란': 3,
      가공식품: 4,
      '수산 / 건어물': 5,
      '쌀 / 잡곡': 6,
      '우유 / 유제품': 7,
      건강식품: 8,
      '장 / 양념 / 소스': 9,
      기타: 10,
    };

    const categoryId = categoryMap[categoryName];
    return categoryId ? [categoryId] : [];
  }, []);

  // 필터링된 아이템들 (API 필터링 사용 시에는 필요 없을 수 있음)
  const filteredItems = actualFridgeItems.filter(
    item =>
      activeItemCategory === '전체' || item.itemCategory === activeItemCategory,
  );

  // 실제 냉장고 아이템 로드 (API 사용)
  const loadActualFridgeItems = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setApiError(null);

        // 카테고리 필터링을 서버에서 처리
        const categoryIds = getCategoryIds(activeItemCategory);
        const items = await getFridgeItemsByFridgeId(fridgeId, categoryIds);

        setActualFridgeItems(items);
        console.log(`냉장고 ${fridgeId}의 실제 아이템들 (API):`, items);
      } catch (error) {
        console.error('냉장고 아이템 로드 실패 (API):', error);

        const errorMessage =
          error instanceof Error ? error.message : '알 수 없는 오류';
        setApiError(errorMessage);

        Alert.alert(
          '네트워크 오류',
          '냉장고 아이템을 불러오는데 실패했습니다. 인터넷 연결을 확인해주세요.',
          [
            { text: '재시도', onPress: () => loadActualFridgeItems() },
            { text: '취소', style: 'cancel' },
          ],
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [fridgeId, activeItemCategory, getCategoryIds],
  );

  // 당겨서 새로고침
  const handleRefresh = useCallback(() => {
    loadActualFridgeItems(true);
  }, [loadActualFridgeItems]);

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
      navigation.setParams({ shouldRefresh: false });
    }
  }, [shouldRefresh, loadActualFridgeItems, navigation]);

  // 카테고리 변경 시 데이터 새로고침
  useEffect(() => {
    loadActualFridgeItems();
  }, [activeItemCategory]);

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

  // 편집 모드 토글 (API 일괄 업데이트)
  const handleEditModeToggle = useCallback(async () => {
    if (!isEditMode) {
      console.log('편집 모드 진입 - 현재 상태 저장');
      setEditModeStartState([...actualFridgeItems]);
      setIsEditMode(true);
    } else {
      console.log('편집 모드 종료 - 변경사항 일괄 적용 중...');
      setIsLoading(true);

      try {
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

        // API를 통한 변경사항 일괄 업데이트
        const updatePromises = changedItems.map(async changedItem => {
          const originalItem = editModeStartState.find(
            item => item.id === changedItem.id,
          );
          if (!originalItem) return;

          try {
            // API 업데이트
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
            throw error;
          }
        });

        await Promise.all(updatePromises);

        // 최신 데이터 다시 로드
        await loadActualFridgeItems();

        Alert.alert('성공', '변경사항이 저장되었습니다.');
      } catch (error) {
        console.error('편집 모드 종료 중 오류:', error);
        Alert.alert(
          '오류',
          '변경사항 저장 중 오류가 발생했습니다. 다시 시도해주세요.',
          [
            { text: '재시도', onPress: handleEditModeToggle },
            { text: '취소', style: 'cancel' },
          ],
        );
        return; // 오류 시 편집 모드 유지
      } finally {
        setIsLoading(false);
      }

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

  // 로컬 상태 변경 핸들러들 (편집 모드 전용)
  const handleQuantityChange = useCallback(
    (itemId: string, newQuantity: string) => {
      if (isEditMode) {
        setActualFridgeItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item,
          ),
        );
      }
    },
    [isEditMode],
  );

  const handleUnitChange = useCallback(
    (itemId: string, newUnit: string) => {
      if (isEditMode) {
        setActualFridgeItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, unit: newUnit } : item,
          ),
        );
      }
    },
    [isEditMode],
  );

  const handleExpiryDateChange = useCallback(
    (itemId: string, newDate: string) => {
      if (isEditMode) {
        setActualFridgeItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, expiryDate: newDate } : item,
          ),
        );
      }
    },
    [isEditMode],
  );

  // 아이템 삭제 (즉시 API 호출)
  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      try {
        const currentItem = actualFridgeItems.find(item => item.id === itemId);

        // API를 통한 삭제
        await deleteItemFromFridge(itemId);

        // 삭제 즉시 사용 기록 추가
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

        // 최신 데이터 다시 로드
        await loadActualFridgeItems();

        Alert.alert('삭제 완료', '아이템이 삭제되었습니다.');
      } catch (error) {
        console.error('아이템 삭제 실패:', error);
        Alert.alert('오류', '아이템 삭제에 실패했습니다. 다시 시도해주세요.');
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

      {/* API 테스트 컴포넌트 (임시) */}
      <ApiTestComponent fridgeId={fridgeId} />

      {/* 메인 콘텐츠 영역 */}
      <View style={styles.mainContent}>
        <FridgeItemList
          items={filteredItems}
          isEditMode={isEditMode}
          isLoading={isLoading}
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
          apiError={apiError}
          onRetry={() => loadActualFridgeItems()}
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

// 테스트 컴포넌트 스타일
const testStyles = StyleSheet.create({
  toggleContainer: {
    padding: 10,
    backgroundColor: '#FFF3E0',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  container: {
    backgroundColor: '#FFF3E0',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  results: {
    maxHeight: 150,
  },
  resultItem: {
    marginBottom: 5,
  },
  stepText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultText: {
    fontSize: 10,
    color: '#666',
  },
});

export default FridgeHomeScreen;
