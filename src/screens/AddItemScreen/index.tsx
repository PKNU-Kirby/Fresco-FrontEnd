import React, { useState, useMemo, useCallback } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  IngredientControllerAPI,
  ConfirmedIngredient,
} from '../../services/API/ingredientControllerAPI';

import { AddItemHeader } from '../../components/AddItem/AddItemHeader';
import { AddItemContent } from '../../components/AddItem/AddItemContent';
import { AddItemActions } from '../../components/AddItem/AddItemActions';
import { useAddItemLogic } from '../../hooks/AddItem/useAddItemLogic';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { addItemStyles as styles } from './styles';
import { RootStackParamList } from '../../../App';

export interface ItemFormData {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  expirationDate: string;
  itemCategory: string;
  photo?: string;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// 확인된 식재료 정보 (API 응답 + 사용자 입력)
export interface ConfirmedIngredient {
  userInput: ItemFormData;
  apiResult: {
    ingredientId: number;
    ingredientName: string;
    categoryId: number;
    categoryName: string;
  };
}

// Navigation types
type AddItemScreenRouteProp = RouteProp<RootStackParamList, 'AddItemScreen'> & {
  params: {
    fridgeId: string;
    // 1. 직접 추가 - 아무 파라미터 없음
    // 2. 카메라 → 수동 입력
    recognizedData?: {
      photo?: string;
      name?: string;
      quantity?: string;
      unit?: string;
      expiryDate?: string;
      itemCategory?: string;
    };
    // 3. 카메라 → 스캔 결과
    scanResults?: ConfirmedIngredient[];
    scanMode?: 'ingredient' | 'receipt';
  };
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddItemScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddItemScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const { fridgeId, recognizedData, scanResults, scanMode } = route.params;

  // 모달 상태들
  const [showFinalConfirmModal, setShowFinalConfirmModal] = useState(false);
  const [showGoBackConfirmModal, setShowGoBackConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [savedItemsCount, setSavedItemsCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // 확인된 식재료 정보 상태
  const [confirmedIngredients, setConfirmedIngredients] = useState<
    ConfirmedIngredient[]
  >(scanResults || []);

  // init item
  const initialItems = useMemo(() => {
    // 1. 스캔 결과가 있는 경우 (카메라 → 스캔)
    if (scanResults && scanResults.length > 0) {
      return scanResults.map(result => result.userInput);
    }

    // 2. 카메라에서 수동 입력 선택한 경우
    if (recognizedData) {
      return [
        {
          id: '1',
          name: recognizedData.name || '',
          quantity: recognizedData.quantity || '1',
          unit: recognizedData.unit || '개',
          expirationDate: recognizedData.expiryDate || '',
          itemCategory: recognizedData.itemCategory || '기타',
          photo: recognizedData.photo,
        },
      ];
    }

    // 3. 직접 추가 (빈 폼)
    return [
      {
        id: '1',
        name: '',
        quantity: '1',
        unit: '개',
        expirationDate: '',
        itemCategory: '채소 / 과일',
      },
    ];
  }, [recognizedData, scanResults]);

  const [isEditMode, setIsEditMode] = useState(!scanResults);

  const {
    items,
    setItems,
    isLoading,
    setIsLoading,
    focusedItemId,
    setFocusedItemId,
    addNewItem,
    removeItem,
    updateItem,
    validateAllItems,
  } = useAddItemLogic(initialItems);

  // ========== 개선된 식재료 확인 로직 ==========
  const confirmIngredients = useCallback(async () => {
    // 이미 스캔 결과가 있으면 그대로 사용
    if (scanResults && scanResults.length > 0) {
      setConfirmedIngredients(scanResults);
      setIsEditMode(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('식재료 확인 시작:', items);

      const confirmed: ConfirmedIngredient[] = [];

      // 여러 식재료를 병렬로 처리 (성능 개선)
      const searchPromises = items.map(async (item, index) => {
        try {
          console.log(`"${item.name}" 검색 중...`);

          // IngredientControllerAPI 사용 (일관성 개선)
          const foundIngredient =
            await IngredientControllerAPI.findIngredientByName(item.name);

          if (foundIngredient) {
            return {
              userInput: item,
              apiResult: foundIngredient,
            };
          } else {
            throw new Error(`"${item.name}"에 대한 식재료를 찾을 수 없습니다.`);
          }
        } catch (error) {
          console.error(`"${item.name}" 검색 실패:`, error);
          throw new Error(
            `"${item.name}" 확인에 실패했습니다: ${error.message}`,
          );
        }
      });

      // 모든 검색을 병렬로 실행
      try {
        const results = await Promise.all(searchPromises);
        setConfirmedIngredients(results);
        setIsEditMode(false);
      } catch (error) {
        // 하나라도 실패하면 전체 실패
        throw error;
      }
    } catch (error) {
      console.error('식재료 확인 실패:', error);
      setErrorMessage(error.message);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  }, [items, scanResults, setIsEditMode, setIsLoading]);

  // ========== 개선된 저장 로직 ==========
  const handleSaveItems = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('식재료 저장 시작:', confirmedIngredients);

      // IngredientControllerAPI의 편의 메소드 사용
      const response = await IngredientControllerAPI.addConfirmedIngredients(
        fridgeId,
        confirmedIngredients,
      );

      console.log('저장 응답:', response);

      // 성공 시
      setSavedItemsCount(confirmedIngredients.length);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('저장 실패:', error);

      // 에러 타입에 따른 메시지 개선
      let errorMessage = '식재료 저장 중 오류가 발생했습니다.';

      if (error.message.includes('네트워크')) {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else if (error.message.includes('권한')) {
        errorMessage = '저장 권한이 없습니다. 관리자에게 문의해주세요.';
      } else if (error.message.includes('냉장고')) {
        errorMessage = '냉장고 정보를 찾을 수 없습니다.';
      }

      setErrorMessage(errorMessage);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  }, [confirmedIngredients, fridgeId, setIsLoading]);

  // ========== 개선된 확인 메시지 생성 ==========
  const confirmationMessage = useMemo(() => {
    if (confirmedIngredients.length === 0) return '';

    let source = '입력된';
    if (scanMode === 'ingredient') source = '식재료 인식으로 확인된';
    else if (scanMode === 'receipt') source = '영수증 스캔으로 확인된';

    const messages = confirmedIngredients.map(confirmed => {
      const userInput = confirmed.userInput.name;
      const apiResult = confirmed.apiResult.ingredientName;
      const category = confirmed.apiResult.categoryName;
      const expiry = confirmed.userInput.expirationDate;

      // 이름이 같으면 단순 표시, 다르면 변환 표시
      const nameDisplay =
        userInput === apiResult
          ? `• ${apiResult}`
          : `• "${userInput}" → "${apiResult}"`;

      return `${nameDisplay}\n  카테고리: ${category}\n  유통기한: ${expiry}`;
    });

    return `${source} 식재료:\n\n${messages.join('\n\n')}\n\n총 ${
      confirmedIngredients.length
    }개 식재료를 냉장고에 추가하시겠습니까?`;
  }, [confirmedIngredients, scanMode]);
  // AddItemScreen.tsx에 추가할 함수
  // AddItemScreen.tsx에 추가할 함수들

  // 최종 확인 모달 핸들러들
  const handleFinalConfirmModalConfirm = useCallback(() => {
    setShowFinalConfirmModal(false);
    handleSaveItems();
  }, [handleSaveItems]);

  const handleFinalConfirmModalCancel = useCallback(() => {
    setShowFinalConfirmModal(false);
  }, []);

  // 뒤로가기 확인 모달 핸들러들
  const handleGoBackConfirmModalConfirm = useCallback(() => {
    setShowGoBackConfirmModal(false);
    navigation.goBack();
  }, [navigation]);

  const handleGoBackConfirmModalCancel = useCallback(() => {
    setShowGoBackConfirmModal(false);
  }, []);
  const handleBackToEdit = useCallback(() => {
    setIsEditMode(true);

    // 스캔 결과가 있었다면 items를 스캔 결과로 복원
    if (scanResults && scanResults.length > 0) {
      const itemsFromScan = scanResults.map(result => result.userInput);
      setItems(itemsFromScan);
    }

    setConfirmedIngredients([]);
  }, [setIsEditMode, scanResults, setItems]);
  // ========== 개선된 성공 후 처리 ==========
  const handleSuccessConfirm = useCallback(() => {
    setShowSuccessModal(false);

    // 낙관적 업데이트를 위한 새 아이템 정보 생성
    const newItems = confirmedIngredients.map((confirmed, index) => ({
      id: `new_${Date.now()}_${index}`, // 고유 ID 생성
      ingredientId: confirmed.apiResult.ingredientId,
      categoryId: confirmed.apiResult.categoryId,
      ingredientName: confirmed.apiResult.ingredientName,
      quantity: parseInt(confirmed.userInput.quantity) || 1,
      unit: confirmed.userInput.unit,
      expirationDate: confirmed.userInput.expirationDate,
      categoryName: confirmed.apiResult.categoryName,
      createdAt: new Date().toISOString(),
    }));

    // 홈화면으로 돌아가면서 새 아이템들 전달
    navigation.navigate('FridgeHome', {
      fridgeId,
      newItems,
      refreshKey: Date.now(), // 강제 새로고침 트리거
    });
  }, [navigation, confirmedIngredients, fridgeId]);

  // ========== 개선된 에러 처리 ==========
  const handleErrorConfirm = useCallback(() => {
    setShowErrorModal(false);
    setErrorMessage('');

    // 에러 후 편집 모드로 돌아가기
    if (!isEditMode) {
      setIsEditMode(true);
    }
  }, [isEditMode]);

  // ========== 개선된 뒤로가기 처리 ==========
  const handleGoBack = useCallback(() => {
    if (isEditMode) {
      // 변경사항이 있는지 확인
      const hasChanges = items.some(
        item =>
          item.name.trim() !== '' ||
          item.quantity !== '1' ||
          item.expirationDate !== '',
      );

      if (hasChanges) {
        setShowGoBackConfirmModal(true);
      } else {
        navigation.goBack();
      }
    } else {
      // 확인 모드에서는 편집으로 돌아가기
      handleBackToEdit();
    }
  }, [isEditMode, items, handleBackToEdit, navigation]);

  // ... 나머지 로직은 기존과 동일 ...

  return (
    <SafeAreaView style={styles.container}>
      {/* ... 기존 JSX ... */}

      {/* 개선된 최종 확인 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={showFinalConfirmModal}
        title="식재료 추가 확인"
        message={confirmationMessage}
        iconContainer={{ backgroundColor: '#d3f0d3' }}
        icon={{ name: 'add-circle-outline', color: 'limegreen', size: 48 }}
        confirmText="추가하기"
        cancelText="취소"
        confirmButtonStyle="primary"
        onConfirm={handleFinalConfirmModalConfirm}
        onCancel={handleFinalConfirmModalCancel}
      />

      {/* 개선된 성공 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={showSuccessModal}
        title="추가 완료!"
        message={`${savedItemsCount}개의 식재료가 성공적으로 냉장고에 추가되었습니다.\n\n이제 홈 화면에서 확인할 수 있습니다.`}
        iconContainer={{ backgroundColor: '#d3f0d3' }}
        icon={{ name: 'check-circle', color: 'limegreen', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={handleSuccessConfirm}
        onCancel={handleSuccessConfirm}
      />

      {/* 개선된 에러 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={showErrorModal}
        title="저장 실패"
        message={`${errorMessage}\n\n다시 시도하시겠습니까?`}
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="다시 시도"
        cancelText="편집으로 돌아가기"
        confirmButtonStyle="primary"
        onConfirm={() => {
          setShowErrorModal(false);
          setErrorMessage('');
          handleSaveItems(); // 자동 재시도
        }}
        onCancel={handleErrorConfirm}
      />
    </SafeAreaView>
  );
};

export default AddItemScreen;
