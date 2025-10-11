import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { AutoCompleteSearchResponse } from '../../services/API/ingredientControllerAPI';
import { ingredientSearchDropdownStyles as styles } from './styles';

interface IngredientSearchDropdownProps {
  searchResults: AutoCompleteSearchResponse[];
  searchError: string | null;
  onSelect: (ingredient: AutoCompleteSearchResponse) => void;
}

const IngredientSearchDropdown: React.FC<IngredientSearchDropdownProps> = ({
  searchResults,
  searchError,
  onSelect,
}) => {
  const renderSearchResult = (
    ingredient: AutoCompleteSearchResponse,
    index: number,
  ) => (
    <TouchableOpacity
      key={`${ingredient.ingredientId}-${index}`}
      style={styles.searchResultItem}
      onPress={() => onSelect(ingredient)}
    >
      <Text style={styles.searchResultName}>{ingredient.ingredientName}</Text>
      <Text style={styles.searchResultCategory}>{ingredient.categoryName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.searchResultsContainer}>
      {searchResults.length > 0 ? (
        searchResults.slice(0, 5).map(renderSearchResult)
      ) : searchError ? (
        <View style={styles.searchErrorItem}>
          <Text style={styles.searchErrorText}>{searchError}</Text>
          <Text style={styles.searchErrorSubText}>
            그래도 입력하신 이름으로 추가할 수 있어요
          </Text>
        </View>
      ) : (
        <View style={styles.searchErrorItem}>
          <Text style={styles.searchErrorText}>검색 결과가 없습니다</Text>
          <Text style={styles.searchErrorSubText}>
            입력하신 이름으로 새로 추가됩니다
          </Text>
        </View>
      )}
    </View>
  );
};

export default IngredientSearchDropdown;
