// recipeAvailabilityUtils.ts 에서

const getFridgeItemsByFridgeId = async (fridgeId: number) => {
  try {
    // ✅ PageResponse를 받아서 content만 추출
    const response = await IngredientControllerAPI.getRefrigeratorIngredients(
      fridgeId,
    );

    console.log('🔍 getFridgeItemsByFridgeId response:', response);
    console.log('🔍 content:', response.content);

    // ✅ content 배열 반환
    return response.content || [];
  } catch (error) {
    console.error('냉장고 아이템 조회 실패:', error);
    return [];
  }
};
