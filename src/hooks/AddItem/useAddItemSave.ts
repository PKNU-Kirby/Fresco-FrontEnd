import { useCallback, useState } from 'react';
import {
  addItemsToFridge,
  getDefaultExpiryDate,
} from '../../utils/fridgeStorage';
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

  const handleSaveItems = useCallback(async () => {
    setIsLoading(true);
    try {
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
      console.log('저장된 아이템들:', savedItems);

      setSavedItemsCount(savedItems.length);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('저장 실패:', error);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  }, [items, fridgeId, navigation, setIsLoading]);

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
          },
        },
      ],
    });
  }, [navigation, fridgeId]);

  const handleErrorConfirm = useCallback(() => {
    setShowErrorModal(false);
  }, []);

  return {
    handleSaveItems,
    showSuccessModal,
    showErrorModal,
    savedItemsCount,
    handleSuccessConfirm,
    handleErrorConfirm,
  };
};
