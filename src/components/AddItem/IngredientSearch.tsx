import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {
  IngredientControllerAPI,
  AutoCompleteSearchResponse,
} from '../../services/API/ingredientControllerAPI';
import { ingredientSearchStyles as styles } from './styles';

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

  // 검색
  const performSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setIsLoading(true);
      // console.log('식재료 검색:', keyword);

      const results = await IngredientControllerAPI.searchIngredients(keyword);

      // console.log('검색 결과:', results);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      // console.error('검색 실패:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      {/* Search Input */}
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

      {/* Search Result List */}
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
