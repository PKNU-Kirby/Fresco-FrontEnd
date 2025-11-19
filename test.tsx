const calculateRecipeAvailabilities = async () => {
  if (!selectedFridge || selectedFridge.recipes.length === 0) {
    return;
  }

  try {
    console.log('🔍 레시피 조리 가능성 계산 시작...');

    const availabilities = new Map<string, RecipeAvailabilityStatus>();
    const details = new Map<string, RecipeDetailResponse>();

    // 👇 현재 접속한 냉장고의 식재료 사용
    const fridgeIngredientsToUse = currentFridgeId
      ? await loadFridgeIngredients(currentFridgeId)
      : selectedFridge.ingredients;

    console.log(
      `🔍 식재료 매칭에 사용할 냉장고: ${
        currentFridgeId || selectedFridge.fridge.id
      }`,
    );

    for (const recipe of selectedFridge.recipes) {
      const recipeDetail = await fetchRecipeDetailWithAlternatives(recipe.id);

      if (recipeDetail) {
        details.set(recipe.id, recipeDetail);
      }

      const status = calculateIngredientStatus(
        recipe,
        fridgeIngredientsToUse, // 👈 수정!
        recipeDetail,
      );

      availabilities.set(recipe.id, status);
    }

    setRecipeDetails(details);
    setRecipeAvailabilities(availabilities);
    console.log('✅ 조리 가능성 계산 완료');
  } catch (error) {
    console.error('❌ 조리 가능성 계산 실패:', error);
  }
};
