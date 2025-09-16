import { useCallback, useState } from 'react';
import { ApiService } from '../../services/apiServices';
import { getDefaultExpiryDate } from '../../utils/fridgeStorage';
import { ItemFormData } from '../../screens/AddItemScreen';

// 확인화면에서 사용할 타입
export type ConfirmedItem = {
  originalName: string;
  correctedName: string;
  ingredientId: number;
  categoryId: number;
  quantity: string;
  unit: string;
  expirationDate: string;
  itemCategory: string;
  isModified: boolean;
};

export const useAddItemSave = (
  items: ItemFormData[],
  fridgeId: string,
  navigation: any,
  setIsLoading: (loading: boolean) => void,
) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [savedItemsCount, setSavedItemsCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // 확인 화면용 상태
  const [confirmedItems, setConfirmedItems] = useState<ConfirmedItem[]>([]);
  const [isProcessingItems, setIsProcessingItems] = useState(false);

  // 카테고리 이름을 ID로 매핑
  const getCategoryId = useCallback((categoryName: string): number => {
    const categoryMap: { [key: string]: number } = {
      베이커리: 1,
      '채소 / 과일': 2,
      '정육 / 계란': 3,
      가공식품: 4,
      '수산 / 건어물': 5,
      '쌀 / 잡곡': 6,
      '주류 / 음료': 7,
      '우유 / 유제품': 8,
      건강식품: 9,
      '장 / 양념 / 소스': 10,
    };
    return categoryMap[categoryName] || 10;
  }, []);

  // 식재료 이름으로 ingredientId 찾기 (확인 화면에서 사용)
  const processItemsForConfirmation = useCallback(async (): Promise<
    ConfirmedItem[]
  > => {
    setIsProcessingItems(true);
    const processedItems: ConfirmedItem[] = [];

    try {
      for (const item of items) {
        let correctedName = item.name;
        let ingredientId = 0;
        let isModified = false;

        try {
          console.log(`식재료 "${item.name}" 자동완성 검색 중...`);

          const response = await ApiService.apiCall<
            Array<{
              ingredientId: number;
              ingredientName: string;
              categoryId: number;
              categoryName: string;
            }>
          >(
            `/ap1/v1/ingredient/auto-complete?keyword=${encodeURIComponent(
              item.name,
            )}`,
          );

          if (response && response.length > 0) {
            const firstResult = response[0];
            correctedName = firstResult.ingredientName;
            ingredientId = firstResult.ingredientId;
            isModified = item.name !== correctedName;

            console.log(
              `✅ "${item.name}" → "${correctedName}" (ID: ${ingredientId})`,
            );
          } else {
            console.log(`❌ "${item.name}" → 검색 결과 없음`);
          }
        } catch (error) {
          console.error(`식재료 "${item.name}" 검색 실패:`, error);
        }

        processedItems.push({
          originalName: item.name,
          correctedName: correctedName,
          ingredientId: ingredientId,
          categoryId: getCategoryId(item.itemCategory),
          quantity: item.quantity,
          unit: item.unit || '개',
          expirationDate:
            item.expirationDate || getDefaultExpiryDate(item.itemCategory),
          itemCategory: item.itemCategory,
          isModified: isModified,
        });
      }

      setConfirmedItems(processedItems);
      return processedItems;
    } finally {
      setIsProcessingItems(false);
    }
  }, [items, getCategoryId]);

  // 확인된 아이템들을 실제로 저장
  const handleSaveConfirmedItems = useCallback(
    async (itemsToSave: ConfirmedItem[]) => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        console.log('확인된 아이템들 저장 시작...');
        console.log('저장할 아이템들:', itemsToSave);

        // ingredientId가 있는 아이템들만 필터링
        const validItems = itemsToSave.filter(item => item.ingredientId > 0);
        const invalidItems = itemsToSave.filter(
          item => item.ingredientId === 0,
        );

        if (invalidItems.length > 0) {
          console.warn(
            'ingredientId가 없는 아이템들:',
            invalidItems.map(item => item.originalName),
          );
        }

        if (validItems.length === 0) {
          throw new Error('저장할 수 있는 식재료가 없습니다.');
        }

        // 백엔드 API 스펙에 맞춰 데이터 구성
        const ingredientsInfo = validItems.map(item => ({
          ingredientId: item.ingredientId,
          categoryId: item.categoryId,
          expirationDate: item.expirationDate,
        }));

        const saveRequest = {
          ingredientsInfo: ingredientsInfo,
        };

        console.log('백엔드 저장 요청:', saveRequest);

        const response = await ApiService.apiCall<
          Array<{
            ingredientId: number;
            ingredientName: string;
            categoryId: number;
            categoryName: string;
            expirationDate: string;
          }>
        >(`/ap1/v1/ingredient/${fridgeId}`, {
          method: 'POST',
          body: JSON.stringify(saveRequest),
        });

        console.log('저장 완료:', response);

        // 성공 처리
        setSavedItemsCount(response.length);
        setShowSuccessModal(true);
      } catch (error) {
        console.error('저장 실패:', error);

        // 실패 시 AsyncStorage fallback
        if (
          error.message.includes('500') ||
          error.message.includes('네트워크')
        ) {
          console.log('API 실패로 인한 AsyncStorage 자동 저장 시작...');
          await handleSaveItemsFallback();
          return;
        }

        let errorMsg = '아이템 저장에 실패했습니다.';
        if (error instanceof Error) {
          errorMsg = error.message;
        }

        setErrorMessage(errorMsg);
        setShowErrorModal(true);
      } finally {
        setIsLoading(false);
      }
    },
    [fridgeId, setIsLoading],
  );

  // AsyncStorage fallback 저장
  const handleSaveItemsFallback = useCallback(async () => {
    try {
      console.log('AsyncStorage fallback 저장 시도...');

      const { addItemsToFridge } = await import('../../utils/fridgeStorage');

      const itemsToSave = items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit || '개',
        expiryDate:
          item.expirationDate || getDefaultExpiryDate(item.itemCategory),
        itemCategory: item.itemCategory,
        imageUri: item.photo,
        fridgeId: fridgeId,
      }));

      const savedItems = await addItemsToFridge(fridgeId, itemsToSave);

      console.log('AsyncStorage로 저장된 아이템들:', savedItems);
      setSavedItemsCount(savedItems.length);
      setShowSuccessModal(true);
    } catch (fallbackError) {
      console.error('AsyncStorage fallback 저장도 실패:', fallbackError);
      setErrorMessage('로컬 저장도 실패했습니다. 앱을 재시작해보세요.');
      setShowErrorModal(true);
    }
  }, [items, fridgeId]);

  const handleSuccessConfirm = useCallback(() => {
    setShowSuccessModal(false);
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          params: {
            fridgeId: fridgeId,
            fridgeName: '내 냉장고',
            shouldRefresh: true,
          },
        },
      ],
    });
  }, [navigation, fridgeId]);

  const handleErrorConfirm = useCallback(() => {
    setShowErrorModal(false);
    setErrorMessage('');
  }, []);

  const handleRetry = useCallback(() => {
    setShowErrorModal(false);
    if (confirmedItems.length > 0) {
      handleSaveConfirmedItems(confirmedItems);
    }
  }, [confirmedItems, handleSaveConfirmedItems]);

  const handleSaveOffline = useCallback(() => {
    setShowErrorModal(false);
    handleSaveItemsFallback();
  }, [handleSaveItemsFallback]);

  return {
    // 기존 메서드들
    showSuccessModal,
    showErrorModal,
    savedItemsCount,
    errorMessage,
    handleSuccessConfirm,
    handleErrorConfirm,
    handleRetry,
    handleSaveOffline,

    // 확인 화면용 새로운 메서드들
    confirmedItems,
    isProcessingItems,
    processItemsForConfirmation,
    handleSaveConfirmedItems,
  };
};
