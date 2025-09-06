import { useCallback, useState } from 'react';
import { ApiService } from '../../services/apiServices';
import { getDefaultExpiryDate } from '../../utils/fridgeStorage';
import { ItemFormData } from '../../screens/AddItemScreen';

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

  // 식재료 이름으로 ingredientId 찾기
  const findIngredientId = async (
    ingredientName: string,
  ): Promise<number | null> => {
    try {
      console.log(`식재료 "${ingredientName}" 검색 중...`);

      // auto-complete API 호출
      const response = await ApiService.apiCall<
        Array<{
          ingredientId: number;
          ingredientName: string;
          categoryId: number;
          categoryName: string;
        }>
      >(
        `/ap1/v1/ingredient/auto-complete?keyword=${encodeURIComponent(
          ingredientName,
        )}`,
      );

      console.log('자동완성 결과:', response);

      if (response && response.length > 0) {
        // 첫 번째 결과 사용 (가장 유사한 항목)
        return response[0].ingredientId;
      }

      return null;
    } catch (error) {
      console.error(`식재료 "${ingredientName}" 검색 실패:`, error);
      return null;
    }
  };

  const handleSaveItems = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      console.log('식재료 ID 확인 및 저장 시작...');
      console.log('저장할 아이템들:', items);

      // 1단계: 모든 식재료의 ingredientId 찾기
      const ingredientsInfo = [];
      const failedItems = [];

      for (const item of items) {
        const ingredientId = await findIngredientId(item.name);

        if (ingredientId) {
          ingredientsInfo.push({
            ingredientId: ingredientId,
            categoryId: getCategoryId(item.itemCategory),
            expirationDate:
              item.expirationDate || getDefaultExpiryDate(item.itemCategory),
          });
          console.log(`✅ "${item.name}" → ingredientId: ${ingredientId}`);
        } else {
          failedItems.push(item.name);
          console.log(`❌ "${item.name}" → 찾을 수 없음`);
        }
      }

      // 찾을 수 없는 식재료가 있으면 알림
      if (failedItems.length > 0) {
        const errorMsg = `다음 식재료를 찾을 수 없습니다:\n${failedItems.join(
          ', ',
        )}\n\n등록된 식재료만 저장하시겠습니까?`;

        if (ingredientsInfo.length === 0) {
          throw new Error('등록할 수 있는 식재료가 없습니다.');
        }

        // 여기서 사용자에게 확인받는 로직 추가 가능
        console.warn(errorMsg);
      }

      if (ingredientsInfo.length === 0) {
        throw new Error('저장할 식재료가 없습니다.');
      }

      // 2단계: 백엔드 API 스펙에 맞춰 저장
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
        error.message.includes('찾을 수 없습니다') ||
        error.message.includes('500')
      ) {
        console.log('API 실패로 인한 AsyncStorage 자동 저장 시작...');
        await handleSaveItemsFallback();
        return;
      }

      let errorMsg = '아이템 저장에 실패했습니다.';

      if (error instanceof Error) {
        if (error.message.includes('네트워크')) {
          errorMsg = '네트워크 연결을 확인해주세요.';
        } else if (error.message.includes('401')) {
          errorMsg = '로그인이 필요합니다.';
        } else if (error.message.includes('403')) {
          errorMsg = '이 냉장고에 아이템을 추가할 권한이 없습니다.';
        } else if (error.message.includes('404')) {
          errorMsg = '냉장고를 찾을 수 없습니다.';
        } else {
          errorMsg = error.message;
        }
      }

      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  }, [items, fridgeId, setIsLoading]);

  // 카테고리 이름을 ID로 매핑
  const getCategoryId = useCallback((categoryName: string): number => {
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
    return categoryMap[categoryName] || 10;
  }, []);

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
    handleSaveItems();
  }, [handleSaveItems]);

  const handleSaveOffline = useCallback(() => {
    setShowErrorModal(false);
    handleSaveItemsFallback();
  }, [handleSaveItemsFallback]);

  return {
    handleSaveItems,
    showSuccessModal,
    showErrorModal,
    savedItemsCount,
    errorMessage,
    handleSuccessConfirm,
    handleErrorConfirm,
    handleRetry,
    handleSaveOffline,
  };
};
