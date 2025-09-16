// === 1. 식재료 검색 및 선택 컴포넌트 ===

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  IngredientControllerAPI,
  AutoCompleteSearchResponse,
} from '../../services/API/ingredientControllerAPI';

interface IngredientSearchProps {
  onSelect: (ingredient: AutoCompleteSearchResponse) => void;
  placeholder?: string;
  initialValue?: string;
}

const IngredientSearch: React.FC<IngredientSearchProps> = ({
  onSelect,
  placeholder = '식재료 이름을 입력하세요',
  initialValue = '',
}) => {
  const [searchText, setSearchText] = useState(initialValue);
  const [searchResults, setSearchResults] = useState<
    AutoCompleteSearchResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // 검색 실행 (디바운싱 적용)
  const performSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('식재료 검색:', keyword);

      const results = await IngredientControllerAPI.searchIngredients(keyword);

      console.log('검색 결과:', results);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('검색 실패:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 디바운싱을 위한 useEffect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchText);
    }, 300); // 300ms 디바운싱

    return () => clearTimeout(timeoutId);
  }, [searchText, performSearch]);

  // 식재료 선택 처리
  const handleSelectIngredient = useCallback(
    (ingredient: AutoCompleteSearchResponse) => {
      setSearchText(ingredient.ingredientName);
      setShowResults(false);
      onSelect(ingredient);
    },
    [onSelect],
  );

  // 검색 결과 아이템 렌더링
  const renderResultItem = ({ item }: { item: AutoCompleteSearchResponse }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectIngredient(item)}
    >
      <View style={styles.resultContent}>
        <Text style={styles.ingredientName}>{item.ingredientName}</Text>
        <Text style={styles.categoryName}>{item.categoryName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 검색 입력창 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder={placeholder}
          placeholderTextColor="#999"
        />
        {isLoading && (
          <ActivityIndicator
            size="small"
            color="#007AFF"
            style={styles.loadingIndicator}
          />
        )}
      </View>

      {/* 검색 결과 리스트 */}
      {showResults && (
        <View style={styles.resultsContainer}>
          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderResultItem}
              keyExtractor={item => item.ingredientId.toString()}
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            !isLoading && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>
                  '{searchText}'에 대한 검색 결과가 없습니다
                </Text>
              </View>
            )
          )}
        </View>
      )}
    </View>
  );
};

export default IngredientSearch;
// === 3. 스타일 정의 ===

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  // 검색 컴포넌트 스타일
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  loadingIndicator: {
    marginLeft: 8,
  },

  // 검색 결과 스타일
  resultsContainer: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderRadius: 8,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: '#fff',
    maxHeight: 200,
  },
  resultsList: {
    maxHeight: 200,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultContent: {
    flexDirection: 'column',
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  noResults: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#999',
    fontSize: 14,
  },

  // AddItemScreen 스타일
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  selectedIngredient: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  selectedLabel: {
    fontSize: 14,
    color: '#666',
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  selectedCategory: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityInput: {
    flex: 2,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  unitInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  dateInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
