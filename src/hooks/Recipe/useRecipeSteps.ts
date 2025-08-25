import React, { useState, useMemo, useCallback } from 'react';
import { Recipe } from '../../screens/RecipeScreen/RecipeNavigator';

export const useRecipeSteps = (recipe: Recipe) => {
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);

  const getStepsArray = useMemo(() => {
    if (!recipe.steps) {
      return [];
    }

    if (Array.isArray(recipe.steps)) {
      return recipe.steps.filter(
        step => step && typeof step === 'string' && step.trim().length > 0,
      );
    }

    if (typeof recipe.steps === 'string') {
      return recipe.steps
        .split('\n')
        .map(step => step.trim())
        .filter(step => step.length > 0);
    }

    return [];
  }, [recipe.steps]);

  // completedSteps 배열 초기화
  React.useEffect(() => {
    setCompletedSteps(new Array(getStepsArray.length).fill(false));
  }, [getStepsArray.length]);

  const toggleStepCompletion = useCallback((index: number) => {
    setCompletedSteps(prev => {
      const newSteps = [...prev];
      newSteps[index] = !newSteps[index];
      return newSteps;
    });
  }, []);

  return {
    completedSteps,
    toggleStepCompletion,
    getStepsArray,
  };
};
