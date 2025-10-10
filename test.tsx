static frontendToApi(recipe: Recipe): CreateRecipeRequest {
    return {
      title: recipe.title,
      ingredients:
        recipe.ingredients?.map(ing => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
        })) || [],
      steps: recipe.steps || [],
      referenceUrl: recipe.referenceUrl,
    };
  }
}