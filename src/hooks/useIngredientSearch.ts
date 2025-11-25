import { useState, useEffect } from 'react';
import {
  IngredientControllerAPI,
  AutoCompleteSearchResponse,
} from '../services/API/ingredientControllerAPI';

interface UseIngredientSearchProps {
  searchQuery: string;
  onSelect: (ingredient: AutoCompleteSearchResponse) => void;
}

export const useIngredientSearch = ({
  searchQuery,
  onSelect,
}: UseIngredientSearchProps) => {
  const [searchResults, setSearchResults] = useState<
    AutoCompleteSearchResponse[]
  >([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchError(null);

        const results = await IngredientControllerAPI.searchIngredients(
          searchQuery,
        );

        setSearchResults(results);
        setShowSearchResults(results.length > 0);

        if (results.length === 0) {
          // console.log('!! 검색 결과 없음 -> 사용자 입력 그대로 사용');
        }
      } catch (error: unknown) {
        let errorMessage = '검색 중 오류 발생';
        if (error instanceof Error) {
          if (error.message.includes('500')) {
            errorMessage = '서버 오류 (500) - 나중에 다시 시도';
          } else if (error.message.includes('네트워크')) {
            errorMessage = '네트워크 오류 - 연결 확인';
          } else if (error.message.includes('timeout')) {
            errorMessage = '검색 시간 초과 - 다시 시도';
          }
        }

        setSearchResults([]);
        setShowSearchResults(false);
        setSearchError(errorMessage);

        // console.log('X 검색 실패로 사용자 입력 그대로 사용');
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms 디바운싱

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectIngredient = (ingredient: AutoCompleteSearchResponse) => {
    onSelect(ingredient);
    setShowSearchResults(false);
    setSearchError(null);
    // console.log('O 식재료 선택 완료 - API 재검색 없이 사용');
  };

  const handleFocus = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setShowSearchResults(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSearchResults(false);
      setSearchError(null);
    }, 200);
  };

  const resetSearch = () => {
    setShowSearchResults(true);
    setSearchError(null);
  };

  return {
    searchResults,
    showSearchResults,
    isSearching,
    searchError,
    handleSelectIngredient,
    handleFocus,
    handleBlur,
    resetSearch,
  };
};
