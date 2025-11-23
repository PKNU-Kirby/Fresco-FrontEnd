import React, { useState, useMemo, useCallback } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { styles } from './styles';
import { RootStackParamList } from '../../../App';

import Config from '../../types/config';
import { AsyncStorageService } from '../../services/AsyncStorageService';

export interface ItemFormData {
  id: number;
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
  const { fridgeId, recognizedData, scanResults, scanMode, fridgeName } =
    route.params;

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
  //  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [savedItemsCount, setSavedItemsCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // 백엔드 응답 저장용 state
  const [savedItemsResponse, setSavedItemsResponse] = useState<any[]>([]);
  const [allSavedItems, setAllSavedItems] = useState<any[]>([]);

  // 확인된 식재료 정보 상태
  const [confirmedIngredients, setConfirmedIngredients] = useState<
    ConfirmedIngredient[]
  >(scanResults || []);

  // 아이템 초기화
  const initialItems = useMemo(() => {
    // 카메라 -> 스캔 결과
    if (scanResults && scanResults.length > 0) {
      return scanResults.map(result => result.userInput);
    }

    // 카메라 -> 수동 입력
    if (recognizedData) {
      return [
        {
          id: 1,
          name: recognizedData.name || '',
          quantity: recognizedData.quantity || 1,
          unit: recognizedData.unit || '개',
          expirationDate: recognizedData.expiryDate || '',
          itemCategory: recognizedData.itemCategory || '기타',
          photo: recognizedData.photo,
        },
      ];
    }
    return [
      {
        id: 1,
        name: '',
        quantity: 1,
        unit: '개',
        expirationDate: '',
        itemCategory: '채소 / 과일',
      },
    ];
  }, [recognizedData, scanResults]);

  // 항상 편집 모드로 시작하기
  const [isEditMode, setIsEditMode] = useState(true);

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
  // AddItemScreen.tsx의 confirmIngredients 함수 수정

  const confirmIngredients = useCallback(async () => {
    // 스캔 결과가 있으면 그대로 사용
    if (scanResults && scanResults.length > 0) {
      console.log('scanResults 사용 (스캔 결과) - items 반영 필요');

      // scanResults를 사용하되 items의 수정사항을 반영
      const updatedConfirmed = scanResults.map(scanResult => {
        const correspondingItem = items.find(
          item => item.id === scanResult.userInput.id,
        );

        if (correspondingItem) {
          return {
            ...scanResult,
            userInput: {
              ...scanResult.userInput,
              quantity: Number(correspondingItem.quantity), // 수정된 값 반영
              unit: correspondingItem.unit, // 수정된 값 반영
              expirationDate: correspondingItem.expirationDate,
              name: correspondingItem.name,
            },
          };
        }
        return scanResult;
      });

      console.log('수정사항 반영된 confirmedIngredients:', updatedConfirmed);
      setConfirmedIngredients(updatedConfirmed);
      setIsEditMode(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('\n ===== 식재료 확인 시작 =====');
      console.log('현재 items 배열 전체:', JSON.stringify(items, null, 2));

      const confirmedList: ConfirmedIngredient[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        console.log(`\n🔍 [${i}] 아이템 처리 시작 --------`);
        console.log('  name:', item.name);
        console.log('  quantity:', item.quantity, typeof item.quantity);
        console.log('  unit:', item.unit);
        console.log('  expirationDate:', item.expirationDate);
        console.log('  selectedIngredient:', !!item.selectedIngredient);

        // 사용자가 이미 식재료를 선택한 경우
        if (item.selectedIngredient) {
          let selectedIngredient = item.selectedIngredient;
          if (typeof selectedIngredient === 'string') {
            try {
              selectedIngredient = JSON.parse(selectedIngredient);
              // console.log('selectedIngredient 파싱 완료');
            } catch (error) {
              // console.error('selectedIngredient 파싱 실패:', error);
              selectedIngredient = {
                ingredientId: -1,
                ingredientName: item.name,
                categoryId: 11,
                categoryName: '기타',
              };
            }
          }

          if (selectedIngredient) {
            // 현재 items[i]의 값을 직접 사용
            const userInput = {
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              unit: item.unit, // items[i]의 unit 사용
              expirationDate: item.expirationDate,
              itemCategory: item.itemCategory,
              photo: item.photo,
            };

            console.log('userInput 생성:', {
              quantity: userInput.quantity,
              unit: userInput.unit,
            });

            confirmedList.push({
              userInput,
              apiResult: selectedIngredient,
            });

            console.log(`[${i}] confirmedList에 추가 완료`);
          }
        } else {
          // console.log('selectedIngredient 없음 - API 호출 필요');

          try {
            console.log(`"${item.name}" 검색 중...`);
            const foundIngredient =
              await IngredientControllerAPI.findIngredientByName(item.name);

            if (foundIngredient) {
              console.log(`"${item.name}" 검색 성공`);

              const userInput = {
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                expirationDate: item.expirationDate,
                itemCategory: item.itemCategory,
                photo: item.photo,
              };

              confirmedList.push({
                userInput,
                apiResult: foundIngredient,
              });

              console.log(`[${i}] confirmedList에 추가 완료 (API 결과)`);
            } else {
              throw new Error(
                `유효하지 않은 식재료 : "${item.name}"
                식재료 명을 다시 확인해 주세요.`,
              );
            }
          } catch (error) {
            console.error(`유효하지 않은 식재료 : "${item.name}"`, error);

            const defaultCategory = getCategoryByName(item.itemCategory);
            const userInput = {
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              expirationDate: item.expirationDate,
              itemCategory: item.itemCategory,
              photo: item.photo,
            };

            confirmedList.push({
              userInput,
              apiResult: {
                ingredientId: -1,
                ingredientName: item.name,
                categoryId: defaultCategory.id,
                categoryName: defaultCategory.name,
              },
            });
            console.log(`[${i}] 기본값으로 추가 (API 실패)`);
          }
        }
      }

      console.log('\n===== 최종 confirmedList =====');
      confirmedList.forEach((confirmed, index) => {
        console.log(`[${index}] ${confirmed.userInput.name}:`);
        console.log(`  quantity: ${confirmed.userInput.quantity}`);
        console.log(`  unit: ${confirmed.userInput.unit}`);
      });

      setConfirmedIngredients(confirmedList);
      setIsEditMode(false);
    } catch (error) {
      console.error('식재료 확인 실패:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '유효하지 않은 식재료가 있습니다.\n식재료 이름을 다시 확인해주세요.';
      setErrorMessage(errorMessage);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  }, [items, scanResults, setIsEditMode, setIsLoading]);

  // ========== 저장 로직 (수정됨) ==========
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
            apiResult = { ingredientId: -1, categoryId: 11 };
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

      // 저장 응답과 개수 저장
      setSavedItemsResponse(response.result || []);
      setSavedItemsCount(confirmedIngredients.length);

      // 누적 저장 (여러 번 등록 가능)
      const newSavedItems = (response.result || []).map(
        (responseItem, index) => {
          const confirmedIngredient = confirmedIngredients[index];
          // 숫자형 임시 id 생성 (중복 우려가 있으면 음수로 만들어 서버 id와 충돌 방지)
          return {
            id: Date.now() + index,
            ingredientId: responseItem.ingredientId,
            categoryId: responseItem.categoryId,
            ingredientName: responseItem.ingredientName,
            quantity: responseItem.quantity,
            unit: confirmedIngredient?.userInput.unit || '개',
            expirationDate: responseItem.expirationDate,
            categoryName:
              confirmedIngredient?.apiResult?.categoryName || '기타',
            createdAt: new Date().toISOString(),
          };
        },
      );

      setAllSavedItems(prev => [...prev, ...newSavedItems]);

      // 성공 메시지 표시 후 편집 모드로 돌아가기
      setShowSuccessModal(true);
    } catch (error) {
      console.log('=== API 호출 실패 ===');
      console.error('에러 상세:', error);

      // 간단한 에러 메시지로 변경
      setErrorMessage(
        '유효하지 않은 식재료가 있습니다.\n식재료 이름을 다시 확인해주세요.',
      );
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  }, [confirmedIngredients, fridgeId, setIsLoading]);
  // 헤더 로직 (수정됨)
  const headerButtonText = useMemo(() => {
    if (isEditMode) {
      return '확인';
    } else {
      return '등록';
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

      if (hasChanges || allSavedItems.length > 0) {
        // 저장된 아이템이 있거나 변경사항이 있으면 확인
        setShowGoBackConfirmModal(true);
      } else {
        navigation.goBack();
      }
    } else {
      // 확인 모드에서는 편집으로 돌아가기
      handleBackToEdit();
    }
  }, [isEditMode, items, navigation, allSavedItems.length]);

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

  // ========== 모달 핸들러들 (수정됨) ==========
  const handleFinalConfirmModalConfirm = useCallback(() => {
    setShowFinalConfirmModal(false);
    handleSaveItems();
  }, [handleSaveItems]);

  const handleFinalConfirmModalCancel = useCallback(() => {
    setShowFinalConfirmModal(false);
  }, []);

  const handleGoBackConfirmModalConfirm = useCallback(() => {
    setShowGoBackConfirmModal(false);

    // 저장된 아이템이 있으면 홈으로 전달
    if (allSavedItems.length > 0) {
      console.log('홈으로 전달하는 allSavedItems:', allSavedItems);

      // 🔥 네비게이션 스택 초기화
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            params: {
              fridgeId,
              fridgeName: fridgeName || '내 냉장고',
              screen: 'FridgeHomeScreen',
              params: {
                fridgeId,
                fridgeName: fridgeName || '내 냉장고',
                newItems: allSavedItems,
                refreshKey: Date.now(),
              },
            },
          },
        ],
      });
    } else {
      navigation.goBack();
    }
  }, [navigation, allSavedItems, fridgeId]);

  const handleGoBackConfirmModalCancel = useCallback(() => {
    setShowGoBackConfirmModal(false);
  }, []);

  // 등록 성공 후 편집 화면으로 돌아가기 (수정됨)
  const handleSuccessConfirm = useCallback(() => {
    setShowSuccessModal(false);

    console.log('홈으로 전달하는 allSavedItems:', allSavedItems);

    // 🔥 네비게이션 스택 초기화 후 홈으로 이동
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          params: {
            fridgeId,
            fridgeName: fridgeName || '내 냉장고',
            screen: 'FridgeHomeScreen',
            params: {
              fridgeId,
              fridgeName: fridgeName || '내 냉장고',
              newItems: allSavedItems,
              refreshKey: Date.now(),
            },
          },
        },
      ],
    });
  }, [navigation, allSavedItems, fridgeId]);

  // 완료 버튼 - 홈으로 이동 (새로 추가)
  const handleComplete = useCallback(() => {
    if (allSavedItems.length === 0) {
      navigation.goBack();
      return;
    }

    console.log('홈으로 전달하는 allSavedItems:', allSavedItems);

    // 네비게이션 스택 초기화
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          params: {
            fridgeId,
            fridgeName: fridgeName || '내 냉장고',
            screen: 'FridgeHomeScreen',
            params: {
              fridgeId,
              fridgeName: fridgeName || '내 냉장고',
              newItems: allSavedItems,
              refreshKey: Date.now(),
            },
          },
        },
      ],
    });
  }, [navigation, allSavedItems, fridgeId]);

  const handleErrorConfirm = useCallback(() => {
    setShowErrorModal(false);
    setErrorMessage('');
    if (!isEditMode) {
      setIsEditMode(true);
    }
  }, [isEditMode]);

  // 확인 메시지
  const confirmationMessage = useMemo(() => {
    if (confirmedIngredients.length === 0) return '';

    return `총 ${confirmedIngredients.length}개 식재료를 냉장고에 추가합니다.`;
  }, [confirmedIngredients]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}
      >
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
          onComplete={allSavedItems.length > 0 ? handleComplete : undefined}
        />
      </KeyboardAvoidingView>

      {/* 뒤로가기 확인 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={showGoBackConfirmModal}
        title={allSavedItems.length > 0 ? '등록 완료' : '식재료 추가 중단'}
        message={
          allSavedItems.length > 0
            ? `${allSavedItems.length}개의 식재료가 등록되었습니다.\n홈 화면으로 이동하시겠습니까?`
            : '지금 나가면 작성 중인 내용이 사라집니다. 정말 나가시겠습니까?'
        }
        iconContainer={{
          backgroundColor: allSavedItems.length > 0 ? '#d3f0d3' : '#fae1dd',
        }}
        icon={{
          name: allSavedItems.length > 0 ? 'check-circle' : 'error-outline',
          color: allSavedItems.length > 0 ? 'limegreen' : 'tomato',
          size: 48,
        }}
        confirmText={allSavedItems.length > 0 ? '홈으로 이동' : '나가기'}
        cancelText="계속 작성"
        confirmButtonStyle={allSavedItems.length > 0 ? 'primary' : 'danger'}
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

      {/* 등록 성공 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={showSuccessModal}
        title="등록 완료"
        message={`${savedItemsCount}개의 식재료가 냉장고에 추가되었습니다.`}
        iconContainer={{ backgroundColor: '#d3f0d3' }}
        icon={{ name: 'check-circle', color: 'limegreen', size: 48 }}
        confirmText="홈으로 이동"
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
          if (!isEditMode) {
            setIsEditMode(true);
          }
        }}
        onCancel={handleErrorConfirm}
      />
    </SafeAreaView>
  );
};

export default AddItemScreen;
