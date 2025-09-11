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

  // 자동완성 API로 식재료 정보 확인
  const confirmIngredients = useCallback(async () => {
    if (scanResults && scanResults.length > 0) {
      setConfirmedIngredients(scanResults);
      setIsEditMode(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('식재료 확인 시작:', items);

      const { ApiService } = require('../../services/apiServices');
      const confirmed: ConfirmedIngredient[] = [];

      for (const item of items) {
        try {
          console.log(`"${item.name}" 검색 중...`);

          // auto-complete API로 식재료 정보 확인
          const searchResponse = await ApiService.apiCall(
            `/ap1/v1/ingredient/auto-complete?keyword=${encodeURIComponent(
              item.name,
            )}`,
          );

          console.log(`"${item.name}" 검색 결과:`, searchResponse);

          if (searchResponse && searchResponse.length > 0) {
            // 첫 번째 결과 사용 (가장 정확한 매치)
            const foundIngredient = searchResponse[0];

            confirmed.push({
              userInput: item,
              apiResult: foundIngredient,
            });

            console.log(
              `"${item.name}" -> "${foundIngredient.ingredientName}"`,
            );
          } else {
            throw new Error(`"${item.name}"에 대한 식재료를 찾을 수 없습니다.`);
          }
        } catch (error) {
          console.error(`"${item.name}" 검색 실패:`, error);
          throw new Error(
            `"${item.name}" 확인에 실패했습니다: ${error.message}`,
          );
        }
      }

      setConfirmedIngredients(confirmed);
      setIsEditMode(false); // 확인 화면으로 전환
    } catch (error) {
      console.error('식재료 확인 실패:', error);
      setErrorMessage(error.message);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  }, [items, scanResults, setIsEditMode, setIsLoading]);

  // 편집 모드로 돌아가기
  const handleBackToEdit = useCallback(() => {
    setIsEditMode(true);

    // 스캔 결과가 있었다면 items를 스캔 결과로 복원
    if (scanResults && scanResults.length > 0) {
      const itemsFromScan = scanResults.map(result => result.userInput);
      setItems(itemsFromScan);
    }

    setConfirmedIngredients([]);
  }, [setIsEditMode, scanResults, setItems]);

  // 뒤로가기 처리
  const handleGoBack = useCallback(() => {
    if (isEditMode) {
      // 편집 중이면 취소 확인
      setShowGoBackConfirmModal(true);
    } else {
      // 확인 모드에서는 편집으로 돌아가기
      handleBackToEdit();
    }
  }, [isEditMode, handleBackToEdit]);

  // 확인 화면용 메시지 생성
  const confirmationMessage = useMemo(() => {
    if (confirmedIngredients.length === 0) return '';

    let source = '입력된';
    if (scanMode === 'ingredient') source = '식재료 인식으로 확인된';
    else if (scanMode === 'receipt') source = '영수증 스캔으로 확인된';

    const messages = confirmedIngredients.map(confirmed => {
      const userInput = confirmed.userInput.name;
      const apiResult = confirmed.apiResult.ingredientName;

      // 이름이 같으면 단순 표시, 다르면 변환 표시
      return userInput === apiResult
        ? `• ${apiResult}`
        : `• "${userInput}" → "${apiResult}"`;
    });

    return `${source} 식재료:\n\n${messages.join(
      '\n',
    )}\n\n냉장고에 추가하시겠습니까?`;
  }, [confirmedIngredients, scanMode]);

  // header button text
  const headerButtonText = useMemo(() => {
    if (isLoading) return '처리 중...';
    if (isEditMode) return '완료';
    return '저장';
  }, [isLoading, isEditMode]);

  const isHeaderButtonDisabled = useMemo(() => {
    if (isLoading) return true;
    if (isEditMode) return items.some(item => !item.name.trim());
    return confirmedIngredients.length === 0;
  }, [isLoading, isEditMode, items, confirmedIngredients]);

  // 실제 저장 로직
  // AddItemScreen에서 handleSaveItems 함수 수정
  const handleSaveItems = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('식재료 저장 시작:', confirmedIngredients);

      const { ApiService } = require('../../services/apiServices');

      // 날짜 형식을 LocalDate가 파싱할 수 있는 형태로 변경
      const ingredientsInfo = confirmedIngredients.map(confirmed => {
        const expirationDate =
          confirmed.userInput.expirationDate || '2025-12-31';

        // 날짜 형식 확인 및 변환
        const formattedDate = expirationDate.includes('T')
          ? expirationDate.split('T')[0] // ISO 형식이면 날짜 부분만 추출
          : expirationDate; // 이미 YYYY-MM-DD 형식

        return {
          ingredientId: confirmed.apiResult.ingredientId,
          categoryId: confirmed.apiResult.categoryId,
          expirationDate: formattedDate, // "2025-12-31" 형식
        };
      });

      const saveRequest = {
        ingredientsInfo: ingredientsInfo,
      };

      console.log('수정된 저장 요청:', saveRequest);

      const response = await ApiService.apiCall(
        `/ap1/v1/ingredient/${fridgeId}`,
        {
          method: 'POST',
          body: JSON.stringify(saveRequest),
        },
      );

      console.log('저장 응답:', response);

      // 성공 시
      setSavedItemsCount(confirmedIngredients.length);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('저장 실패:', error);
      setErrorMessage('식재료 저장 중 오류가 발생했습니다.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  }, [confirmedIngredients, fridgeId, setIsLoading]);

  const handleSuccessConfirm = useCallback(() => {
    setShowSuccessModal(false);

    // 새로 추가된 아이템들을 홈화면에 전달 (낙관적 업데이트)
    const newItems = confirmedIngredients.map(confirmed => ({
      id: `temp_${Date.now()}_${Math.random()}`, // 임시 ID
      name: confirmed.apiResult.ingredientName,
      quantity: confirmed.userInput.quantity,
      unit: confirmed.userInput.unit,
      expiryDate: confirmed.userInput.expirationDate,
      itemCategory: confirmed.apiResult.categoryName,
      ingredientId: confirmed.apiResult.ingredientId,
      categoryId: confirmed.apiResult.categoryId,
    }));

    navigation.goBack();
    // params로 새 아이템 정보 전달
    navigation.setParams({ newItems });
  }, [navigation, confirmedIngredients]);

  // 에러 모달 확인 핸들러
  const handleErrorConfirm = useCallback(() => {
    setShowErrorModal(false);
    setErrorMessage('');
  }, []);

  // event handlers
  const handleEditComplete = useCallback(() => {
    const validation = validateAllItems();
    if (!validation.isValid) {
      Alert.alert('입력 오류', validation.message);
      return;
    }
    // 편집 완료 시 자동완성 API 호출해서 확인
    confirmIngredients();
  }, [validateAllItems, confirmIngredients]);

  const handleFinalConfirm = useCallback(() => {
    setShowFinalConfirmModal(true);
  }, []);

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

  // 확인 화면용 메시지 생성
  /*
  const confirmationMessage = useMemo(() => {
    if (confirmedIngredients.length === 0) return '';

    const messages = confirmedIngredients.map(
      confirmed =>
        `"${confirmed.userInput.name}" → "${confirmed.apiResult.ingredientName}"`,
    );

    return `다음 식재료로 추가됩니다:\n${messages.join('\n')}`;
  }, [confirmedIngredients]);
*/

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <AddItemHeader
          onGoBack={handleGoBack}
          onHeaderButtonPress={
            isEditMode ? handleEditComplete : handleFinalConfirm
          }
          headerButtonText={headerButtonText}
          isHeaderButtonDisabled={isHeaderButtonDisabled}
        />

        <AddItemContent
          items={items}
          isEditMode={isEditMode}
          focusedItemId={focusedItemId}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
          onFocusComplete={() => setFocusedItemId(null)}
          onAddNewItem={addNewItem}
          confirmedIngredients={confirmedIngredients}
        />

        <AddItemActions
          isEditMode={isEditMode}
          onAddNewItem={addNewItem}
          onBackToEdit={handleBackToEdit}
        />

        {/* 뒤로 가기 확인 모달 */}
        <ConfirmModal
          isAlert={true}
          visible={showGoBackConfirmModal}
          title="등록 취소"
          message="작성 중인 내용이 삭제됩니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText="계속 작성"
          confirmButtonStyle="danger"
          onConfirm={handleGoBackConfirmModalConfirm}
          onCancel={handleGoBackConfirmModalCancel}
        />

        {/* 최종 확인 모달 */}
        <ConfirmModal
          isAlert={true}
          visible={showFinalConfirmModal}
          title="식재료 추가"
          message={confirmationMessage}
          iconContainer={{ backgroundColor: '#d3f0d3' }}
          icon={{ name: 'add-circle-outline', color: 'limegreen', size: 48 }}
          confirmText="확인"
          cancelText="취소"
          confirmButtonStyle="primary"
          onConfirm={handleFinalConfirmModalConfirm}
          onCancel={handleFinalConfirmModalCancel}
        />

        {/* 성공 모달 */}
        <ConfirmModal
          isAlert={false}
          visible={showSuccessModal}
          title="추가 완료"
          message={`${savedItemsCount}개의 식재료가 냉장고에 추가되었습니다.`}
          iconContainer={{ backgroundColor: '#d3f0d3' }}
          icon={{ name: 'check', color: 'limegreen', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={handleSuccessConfirm}
          onCancel={handleSuccessConfirm}
        />

        {/* 에러 모달 */}
        <ConfirmModal
          isAlert={false}
          visible={showErrorModal}
          title="오류"
          message={errorMessage}
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText="확인"
          confirmButtonStyle="danger"
          onConfirm={handleErrorConfirm}
          onCancel={handleErrorConfirm}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddItemScreen;
