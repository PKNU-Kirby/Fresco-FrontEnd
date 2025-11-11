// AIRecipeScreen - handleSaveRecipe
import { AsyncStorageService } from '../../../services/AsyncStorageService';

const handleSaveRecipe = async () => {
  if (!generatedRecipe) return;

  Alert.alert('레시피 저장', '이 레시피를 내 레시피에 저장하시겠습니까?', [
    { text: '취소', style: 'cancel' },
    {
      text: '저장',
      onPress: async () => {
        try {
          setIsLoading(true);

          const saveData = {
            title: generatedRecipe.title,
            ingredients: generatedRecipe.ingredients.map(ing => ({
              ingredientName: ing.name,
              quantity: ing.quantity || 0,
              unit: ing.unit,
            })),
            steps: generatedRecipe.steps,
            substitutions: generatedRecipe.substitutions || [],
          };

          console.log('📤 AI 레시피 저장 요청:', saveData);
          const savedRecipe = await RecipeAPI.saveAIRecipe(saveData);
          console.log('✅ AI 레시피 저장 성공:', savedRecipe);

          // ✅ 현재 선택된 냉장고 ID 가져오기
          const currentFridgeId =
            await AsyncStorageService.getSelectedFridgeId();
          console.log('📦 현재 냉장고 ID:', currentFridgeId);

          Alert.alert('성공', '레시피가 저장되었습니다.', [
            {
              text: '확인',
              onPress: () => {
                navigation.replace('RecipeDetail', {
                  recipe: {
                    id: savedRecipe.recipeId.toString(),
                    title: savedRecipe.title,
                    createdAt: new Date().toISOString().split('T')[0],
                    ingredients: savedRecipe.ingredients.map((ing, index) => ({
                      id: `saved_${savedRecipe.recipeId}_${index}`,
                      name: ing.name,
                      quantity: ing.quantity,
                      unit: ing.unit,
                    })),
                    steps: Array.isArray(savedRecipe.steps)
                      ? savedRecipe.steps
                      : savedRecipe.steps.split('\n'),
                    referenceUrl: savedRecipe.url || '',
                  },
                  fridgeId: currentFridgeId, // ✅ 추가!
                  isNewRecipe: false,
                  isEditing: false,
                });
              },
            },
          ]);
        } catch (error: any) {
          console.error('❌ AI 레시피 저장 실패:', error);
          Alert.alert('오류', error.message || '레시피 저장에 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      },
    },
  ]);
};
