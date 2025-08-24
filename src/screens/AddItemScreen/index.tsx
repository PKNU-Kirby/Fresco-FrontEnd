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

import { AddItemHeader } from './AddItemHeader';
import { AddItemContent } from './AddItemContent';
import { AddItemActions } from './AddItemActions';
import { useAddItemLogic } from '../../hooks/useAddItemLogic';
import { useAddItemSave } from '../../hooks/useAddItemSave';
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

// Navigation types
type AddItemScreenRouteProp = RouteProp<RootStackParamList, 'AddItemScreen'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddItemScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddItemScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const { fridgeId, recognizedData } = route.params;
  const [showFinalConfirmModal, setShowFinalConfirmModal] = useState(false);
  const [showGoBackConfirmModal, setShowGoBackConfirmModal] = useState(false);

  // init item
  const initialItems = useMemo(
    () => [
      {
        id: '1',
        name: recognizedData?.name || '',
        quantity: recognizedData?.quantity || '1',
        unit: recognizedData?.unit || '개',
        expirationDate: recognizedData?.expiryDate || '',
        itemCategory: recognizedData?.itemCategory || '채소 / 과일',
        photo: recognizedData?.photo,
      },
    ],
    [recognizedData],
  );

  const {
    items,
    isEditMode,
    setIsEditMode,
    isLoading,
    setIsLoading,
    focusedItemId,
    setFocusedItemId,
    addNewItem,
    removeItem,
    updateItem,
    validateAllItems,
  } = useAddItemLogic(initialItems);

  // 저장 로직
  const {
    handleSaveItems,
    showSuccessModal,
    showErrorModal,
    savedItemsCount,
    handleSuccessConfirm,
    handleErrorConfirm,
  } = useAddItemSave(items, fridgeId, navigation, setIsLoading);

  // event handlers
  const handleEditComplete = useCallback(() => {
    const validation = validateAllItems();
    if (!validation.isValid) {
      Alert.alert('입력 오류', validation.message);
      return;
    }
    setIsEditMode(false);
  }, [validateAllItems, setIsEditMode]);

  const handleBackToEdit = useCallback(() => {
    setIsEditMode(true);
  }, [setIsEditMode]);

  const handleFinalConfirm = useCallback(() => {
    const validation = validateAllItems();
    if (!validation.isValid) {
      Alert.alert('입력 오류', validation.message);
      return;
    }
    setShowFinalConfirmModal(true);
  }, [validateAllItems]);

  // 최종 확인 모달 핸들러들
  const handleFinalConfirmModalConfirm = useCallback(() => {
    setShowFinalConfirmModal(false);
    handleSaveItems();
  }, [handleSaveItems]);

  const handleFinalConfirmModalCancel = useCallback(() => {
    setShowFinalConfirmModal(false);
  }, []);

  const handleGoBack = useCallback(() => {
    if (isEditMode) {
      setShowGoBackConfirmModal(true);
    } else {
      handleBackToEdit();
    }
  }, [isEditMode, handleBackToEdit]);

  // 뒤로가기 확인 모달 핸들러들 추가
  const handleGoBackConfirmModalConfirm = useCallback(() => {
    setShowGoBackConfirmModal(false);
    navigation.goBack();
  }, [navigation]);

  const handleGoBackConfirmModalCancel = useCallback(() => {
    setShowGoBackConfirmModal(false);
  }, []);

  // header button text
  const headerButtonText = useMemo(() => {
    if (isLoading) return '저장 중...';
    if (isEditMode) return '완료';
    return '확인';
  }, [isLoading, isEditMode]);

  const isHeaderButtonDisabled = useMemo(() => {
    return isLoading || items.some(item => !item.name.trim());
  }, [isLoading, items]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        {/* 기존 컴포넌트들 유지 */}
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
          icon={{ name: 'error-outline', color: 'tomato' }}
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
          message={`${
            items.length === 1 ? '식재료' : `식재료 ${items.length}개`
          }를 냉장고에 추가합니다.`}
          iconContainer={{ backgroundColor: '#d3f0d3' }}
          icon={{ name: 'add-circle-outline', color: '#32CD32' }}
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
          icon={{ name: 'check', color: 'limegreen' }}
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
          message="식재료 저장 중 오류가 발생했습니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato' }}
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
