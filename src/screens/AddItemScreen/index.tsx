import React, { useState, useMemo, useCallback } from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
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

import Config from '../../types/config';
import { AsyncStorageService } from '../../services/AsyncStorageService';

export interface ItemFormData {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expirationDate: string;
  itemCategory: string;
  photo?: string;
  selectedIngredient?: {
    ingredientId: number;
    ingredientName: string;
    categoryId: number;
    categoryName: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Navigation types
type AddItemScreenRouteProp = RouteProp<RootStackParamList, 'AddItemScreen'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddItemScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddItemScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const { fridgeId, recognizedData, scanResults, scanMode } = route.params;

  const getCategoryByName = (categoryName: string) => {
    const categoryMap: { [key: string]: { id: number; name: string } } = {
      베이커리: { id: 1, name: '베이커리' },
      '채소 / 과일': { id: 2, name: '채소 / 과일' },
      '정육 / 계란': { id: 3, name: '정육 / 계란' },
      가공식품: { id: 4, name: '가공식품' },
      '수산 / 건어물': { id: 5, name: '수산 / 건어물' },
      '쌀 / 잡곡': { id: 6, name: '쌀 / 잡곡' },
      '주류 / 음료': { id: 7, name: '주류 / 음료' },
      '우유 / 유제품': { id: 8, name: '우유 / 유제품' },
      건강식품: { id: 9, name: '건강식품' },
      '장 / 양념 / 소스': { id: 10, name: '장 / 양념 / 소스' },
      기타: { id: 11, name: '기타' },
    };
    return categoryMap[categoryName] || categoryMap['기타'];
  };

  // 모달 상태
  const [showFinalConfirmModal, setShowFinalConfirmModal] = useState(false);
  const [showGoBackConfirmModal, setShowGoBackConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [savedItemsCount, setSavedItemsCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // 백엔드 응답 저장용 state
  const [savedItemsResponse, setSavedItemsResponse] = useState<any[]>([]);

  // 확인된 식재료 정보 상태
  const [confirmedIngredients, setConfirmedIngredients] = useState<
    ConfirmedIngredient[]
  >(scanResults || []);

  // init item
  const initialItems = useMemo(() => {
    // 스캔 결과가 있는 경우 (카메라 → 스캔)
    if (scanResults && scanResults.length > 0) {
      return scanResults.map(result => result.userInput);
    }

    // 카메라에서 수동 입력 선택한 경우
    if (recognizedData) {
      return [
        {
          id: '1',
          name: recognizedData.name || '',
          quantity: recognizedData.quantity || 1,
          unit: recognizedData.unit || '개',
          expirationDate: recognizedData.expiryDate || '',
          itemCategory: recognizedData.itemCategory || '기타',
          photo: recognizedData.photo,
        },
      ];
    }

    // 직접 추가
    return [
      {
        id: '1',
        name: '',
        quantity: 1,
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

  // 식재료 확인 로직
  const confirmIngredients = useCallback(async () => {
    // 스캔 결과가 있으면 그대로 사용
    if (scanResults && scanResults.length > 0) {
      setConfirmedIngredients(scanResults);
      setIsEditMode(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('식재료 확인 시작:', items);

      const confirmedList: ConfirmedIngredient[] = [];

      for (const item of items) {
        // 사용자가 이미 식재료를 선택한 경우, API 호출 없이 그 정보 사용
        if (item.selectedIngredient) {
          // selectedIngredient가 문자열인 경우 파싱
          let selectedIngredient = item.selectedIngredient;
          if (typeof selectedIngredient === 'string') {
            try {
              selectedIngredient = JSON.parse(selectedIngredient);
            } catch (error) {
              console.error('selectedIngredient 파싱 실패:', error);
              selectedIngredient = null;
            }
          }

          if (selectedIngredient) {
            confirmedList.push({
              userInput: item,
              apiResult: selectedIngredient,
            });
          }
        } else {
          // 사용자가 선택하지 않은 경우에만 API 호출
          try {
            console.log(`"${item.name}" 검색 중...`);
            const foundIngredient =
              await IngredientControllerAPI.findIngredientByName(item.name);

            if (foundIngredient) {
              confirmedList.push({
                userInput: item,
                apiResult: foundIngredient,
              });
            } else {
              throw new Error(
                `"${item.name}"에 대한 식재료를 찾을 수 없습니다.`,
              );
            }
          } catch (error) {
            console.error(`"${item.name}" 검색 실패:`, error);

            const defaultCategory = getCategoryByName(item.itemCategory);
            confirmedList.push({
              userInput: item,
              apiResult: {
                ingredientId: -1,
                ingredientName: item.name,
                categoryId: defaultCategory.id,
                categoryName: defaultCategory.name,
              },
            });
            console.log(`"${item.name}" - API 실패로 사용자 입력 그대로 사용`);
          }
        }
      }

      setConfirmedIngredients(confirmedList);
      setIsEditMode(false);
    } catch (error) {
      console.error('식재료 확인 실패:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.';
      setErrorMessage(errorMessage);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  }, [items, scanResults, setIsEditMode, setIsLoading]);

  // ========== 저장 로직 ==========
  const handleSaveItems = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('=== API 호출 디버깅 시작 ===');

      // 1. 환경 정보 확인
      console.log('Config.API_BASE_URL:', Config.API_BASE_URL);

      // 2. 토큰 확인
      const token = await AsyncStorageService.getAuthToken();
      console.log(
        '현재 토큰:',
        token ? `${token.substring(0, 20)}...` : 'null',
      );

      // 3. fridgeId 확인
      console.log('fridgeId:', fridgeId, typeof fridgeId);

      // 4. confirmedIngredients 확인
      console.log(
        'confirmedIngredients:',
        JSON.stringify(confirmedIngredients, null, 2),
      );

      // 5. 요청 데이터 생성 확인
      const ingredientIds: number[] = [];
      const ingredientsInfo = confirmedIngredients.map(confirmed => {
        // apiResult가 문자열인 경우 파싱
        let apiResult = confirmed.apiResult;
        if (typeof apiResult === 'string') {
          try {
            apiResult = JSON.parse(apiResult);
          } catch (error) {
            console.error('저장 시 apiResult 파싱 실패:', error);
            apiResult = { ingredientId: -1, categoryId: 11 }; // 기본값 (기타 카테고리)
          }
        }

        const ingredientId = apiResult.ingredientId || 0;
        ingredientIds.push(ingredientId);

        return {
          ingredientId: ingredientId,
          categoryId: apiResult.categoryId || 11, // 기타 카테고리
          quantity: confirmed.userInput.quantity || 1,
          unit: confirmed.userInput.unit || '개',
          expirationDate:
            confirmed.userInput.expirationDate ||
            new Date().toISOString().split('T')[0],
        };
      });

      const saveRequest = {
        ingredientsInfo,
        ingredientIds,
      };
      console.log('최종 요청 데이터:', JSON.stringify(saveRequest, null, 2));

      console.log('API 호출 시작...');
      const response = await IngredientControllerAPI.addConfirmedIngredients(
        fridgeId,
        confirmedIngredients,
      );

      console.log('=== API 호출 성공 ===');
      console.log('응답:', JSON.stringify(response, null, 2));

      // 백엔드 응답 저장
      setSavedItemsResponse(response.result || []);
      setSavedItemsCount(confirmedIngredients.length);
      setShowSuccessModal(true);
    } catch (error) {
      console.log('=== API 호출 실패 ===');
      console.error('에러 상세:', error);
      console.error('에러 메시지:', error.message);
      console.error('에러 스택:', error.stack);

      let errorMessage = '식재료 저장 중 오류가 발생했습니다.';
      if (error.message.includes('네트워크')) {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else if (error.message.includes('권한')) {
        errorMessage = '저장 권한이 없습니다. 관리자에게 문의해주세요.';
      } else if (error.message.includes('냉장고')) {
        errorMessage = '냉장고 정보를 찾을 수 없습니다.';
      }

      setErrorMessage(`${errorMessage}\n\n상세: ${error.message}`);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  }, [confirmedIngredients, fridgeId, setIsLoading]);

  // 헤더 로직
  const headerButtonText = useMemo(() => {
    if (isEditMode) {
      return '확인';
    } else {
      return '저장';
    }
  }, [isEditMode]);

  const isHeaderButtonDisabled = useMemo(() => {
    if (isEditMode) {
      // 편집 모드에서는 최소 하나의 식재료 이름이 입력되어야 함
      return isLoading || !items.some(item => item.name.trim() !== '');
    } else {
      // 확인 모드에서는 확인된 식재료가 있어야 함
      return isLoading || confirmedIngredients.length === 0;
    }
  }, [isEditMode, isLoading, items, confirmedIngredients]);

  const handleHeaderButtonPress = useCallback(() => {
    if (isEditMode) {
      // 편집 모드에서는 식재료 확인
      confirmIngredients();
    } else {
      // 확인 모드에서는 최종 확인 모달 표시
      setShowFinalConfirmModal(true);
    }
  }, [isEditMode, confirmIngredients]);

  // 뒤로가기
  const handleGoBack = useCallback(() => {
    if (isEditMode) {
      // 변경사항이 있는지 확인
      const hasChanges = items.some(
        item =>
          item.name.trim() !== '' ||
          item.quantity !== 1 ||
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
  }, [isEditMode, items, navigation]);

  // ========== Actions 관련 로직 ==========
  const handleBackToEdit = useCallback(() => {
    setIsEditMode(true);
    if (scanResults && scanResults.length > 0) {
      const itemsFromScan = scanResults.map(result => result.userInput);
      setItems(itemsFromScan);
    }
    setConfirmedIngredients([]);
  }, [setIsEditMode, scanResults, setItems]);

  const handleFocusComplete = useCallback(() => {
    setFocusedItemId(null);
  }, [setFocusedItemId]);

  // ========== 모달 핸들러들 ==========
  const handleFinalConfirmModalConfirm = useCallback(() => {
    setShowFinalConfirmModal(false);
    handleSaveItems();
  }, [handleSaveItems]);

  const handleFinalConfirmModalCancel = useCallback(() => {
    setShowFinalConfirmModal(false);
  }, []);

  const handleGoBackConfirmModalConfirm = useCallback(() => {
    setShowGoBackConfirmModal(false);
    navigation.goBack();
  }, [navigation]);

  const handleGoBackConfirmModalCancel = useCallback(() => {
    setShowGoBackConfirmModal(false);
  }, []);

  const handleSuccessConfirm = useCallback(() => {
    setShowSuccessModal(false);

    // 백엔드 응답 데이터를 사용해서 newItems 생성
    const newItems = savedItemsResponse.map((responseItem, index) => {
      // 해당하는 confirmedIngredient 찾기
      const confirmedIngredient = confirmedIngredients[index];

      return {
        id: `new_${Date.now()}_${index}`,
        ingredientId: responseItem.ingredientId,
        categoryId: responseItem.categoryId,
        ingredientName: responseItem.ingredientName,
        quantity: responseItem.quantity, // 백엔드 응답값 사용
        unit: confirmedIngredient?.userInput.unit || '개', // 단위는 프론트에서만 관리
        expirationDate: responseItem.expirationDate, // 백엔드에서 계산된 날짜 사용
        categoryName: confirmedIngredient?.apiResult?.categoryName || '기타',
        createdAt: new Date().toISOString(),
      };
    });

    console.log('홈으로 전달하는 newItems (백엔드 응답 기반):', newItems);

    navigation.navigate('MainTabs', {
      fridgeId,
      fridgeName: '냉장고',
      screen: 'FridgeHomeScreen',
      params: {
        fridgeId,
        fridgeName: '냉장고',
        newItems,
        refreshKey: Date.now(),
      },
    });
  }, [navigation, savedItemsResponse, confirmedIngredients, fridgeId]);

  const handleErrorConfirm = useCallback(() => {
    setShowErrorModal(false);
    setErrorMessage('');
    if (!isEditMode) {
      setIsEditMode(true);
    }
  }, [isEditMode]);

  // 확인 메시지 생성
  const confirmationMessage = useMemo(() => {
    if (confirmedIngredients.length === 0) return '';

    return `총 ${confirmedIngredients.length}개 식재료를 냉장고에 추가하시겠습니까?`;
  }, [confirmedIngredients]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}
      >
        {/* 기존 컴포넌트와 맞는 props 전달 */}
        <AddItemHeader
          onGoBack={handleGoBack}
          onHeaderButtonPress={handleHeaderButtonPress}
          headerButtonText={headerButtonText}
          isHeaderButtonDisabled={isHeaderButtonDisabled}
        />

        <AddItemContent
          items={items}
          isEditMode={isEditMode}
          focusedItemId={focusedItemId}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
          onFocusComplete={handleFocusComplete}
          onAddNewItem={addNewItem}
          confirmedIngredients={confirmedIngredients}
        />

        <AddItemActions
          isEditMode={isEditMode}
          onAddNewItem={addNewItem}
          onBackToEdit={handleBackToEdit}
        />
      </KeyboardAvoidingView>

      {/* 뒤로가기 확인 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={showGoBackConfirmModal}
        title="식재료 추가 중단"
        message="지금 나가면 작성 중인 내용이 사라집니다. 정말 나가시겠습니까?"
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="나가기"
        cancelText="계속 작성"
        confirmButtonStyle="danger"
        onConfirm={handleGoBackConfirmModalConfirm}
        onCancel={handleGoBackConfirmModalCancel}
      />

      {/* 최종 확인 모달 */}
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

      {/* 성공 모달 */}
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

      {/* 에러 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={showErrorModal}
        title="저장 실패"
        message={`${errorMessage}\n\n다시 시도하시겠습니까?`}
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
        confirmText="다시 시도"
        cancelText="편집으로 돌아가기"
        confirmButtonStyle="danger"
        onConfirm={() => {
          setShowErrorModal(false);
          setErrorMessage('');
          handleSaveItems();
        }}
        onCancel={handleErrorConfirm}
      />
    </SafeAreaView>
  );
};

export default AddItemScreen;
