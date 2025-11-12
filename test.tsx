// RecipeDetailScreen.tsx에서
const {
  recipe,
  isEditing = false,
  isNewRecipe = false,
  fridgeId,
  fridgeName, // 👈 이게 이미 있어야 함
  aiGeneratedData,
  isSharedRecipe = false,
} = route.params;

// ...

{
  isSharedRecipe && (
    <SharedRecipeIndicator sharedBy={fridgeName} /> // 👈 fridgeName 전달
  );
}
