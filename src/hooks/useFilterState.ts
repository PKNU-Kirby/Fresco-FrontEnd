import {useState, useMemo} from 'react';
import {FridgeItem} from './useFridgeData';

export const useFilterState = (fridgeItems: FridgeItem[]) => {
  const [activeStorageType, setActiveStorageType] = useState('냉장실');
  const [activeItemCategory, setActiveItemCategory] = useState('전체');
  const [isListEditMode, setIsListEditMode] = useState(false);

  // 이중 필터링 (보관 분류 + 식재료 유형)
  const filteredItems = useMemo(() => {
    return fridgeItems
      .filter(
        item =>
          activeStorageType === '전체' ||
          item.storageType === activeStorageType,
      ) // 보관 분류 필터
      .filter(
        item =>
          activeItemCategory === '전체' ||
          item.itemCategory === activeItemCategory,
      ); // 식재료 유형 필터
  }, [fridgeItems, activeStorageType, activeItemCategory]);

  const toggleEditMode = () => {
    setIsListEditMode(!isListEditMode);
  };

  return {
    activeStorageType,
    setActiveStorageType,
    activeItemCategory,
    setActiveItemCategory,
    isListEditMode,
    setIsListEditMode,
    toggleEditMode,
    filteredItems,
  };
};
