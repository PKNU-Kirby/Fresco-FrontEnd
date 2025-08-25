/**
 * Recipe Screen
 *
 * List Header & Footer Component
 *
 * 즐겨찾기 여부를 Props로 받음
 */

import React from 'react';
import { View } from 'react-native';
import SharedRecipeFolder from './SharedRecipeFolder';
import PaginationButton from './PaginationButton';

// List Header
interface ListHeaderProps {
  shouldShow: boolean;
  recipeCount: number;
  onPress: () => void;
}

export const ListHeader: React.FC<ListHeaderProps> = ({
  shouldShow,
  recipeCount,
  onPress,
}) => {
  if (!shouldShow) return null;

  return <SharedRecipeFolder recipeCount={recipeCount} onPress={onPress} />;
};

// List Footer
interface ListFooterProps {
  hasMoreRecipes: boolean;
  onLoadMore: () => void;
  currentCount: number;
  totalCount: number;
}

export const ListFooter: React.FC<ListFooterProps> = ({
  hasMoreRecipes,
  onLoadMore,
  currentCount,
  totalCount,
}) => (
  <View>
    {hasMoreRecipes && (
      <PaginationButton
        type="loadMore"
        onPress={onLoadMore}
        text={`더보기 (${currentCount}/${totalCount})`}
      />
    )}
  </View>
);
