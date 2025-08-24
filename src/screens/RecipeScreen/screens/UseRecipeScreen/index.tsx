// screens/recipe/UseRecipeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Recipe, RecipeStackParamList } from '../../RecipeNavigator';

// SliderQuantityInput import
import SliderQuantityInput from './SliderQuantityInput';

// FridgeStorage를 직접 import 대신 fridgeStorage.tsx 사용
import {
  getFridgeItemsByFridgeId,
  updateFridgeItem,
  FridgeItem,
} from '../../../../utils/fridgeStorage';
import { styles } from './styles';

// 🔧 카드 분리 방식을 위한 단순한 타입 정의
interface MatchedIngredientSeparate {
  recipeIngredient: {
    name: string;
    quantity: string;
  };
  fridgeIngredient: FridgeItem | null; // 단일 아이템 (없을 수도 있음)
  isAvailable: boolean;
  userInputQuantity: string;
  maxUserQuantity: number;
  isDeducted: boolean;
  isMultipleOption?: boolean; // 같은 재료의 여러 옵션 중 하나인지 표시
  optionIndex?: number; // 몇 번째 옵션인지 (1, 2, 3...)
}

type UseRecipeScreenNavigationProp = NativeStackNavigationProp<
  RecipeStackParamList,
  'UseRecipe'
>;
type UseRecipeScreenRouteProp = RouteProp<RecipeStackParamList, 'UseRecipe'>;

const UseRecipeScreen: React.FC = () => {
  const navigation = useNavigation<UseRecipeScreenNavigationProp>();
  const route = useRoute<UseRecipeScreenRouteProp>();

  const { recipe, fridgeId } = route.params;

  // 상태 관리 (카드 분리 방식 타입 사용)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const [matchedIngredients, setMatchedIngredients] = useState<
    MatchedIngredientSeparate[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    loadFridgeIngredients();
  }, []);

  // 고급 문자열 매칭 함수들
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '') // 모든 공백 제거
      .replace(/[^\w가-힣]/g, ''); // 특수문자 제거, 한글/영문/숫자만 남김
  };

  // 모든 매칭되는 옵션들을 찾는 함수
  const findAllMatches = (
    recipeName: string,
    fridgeItems: FridgeItem[],
  ): FridgeItem[] => {
    console.log(`🔍 "${recipeName}" 다중 매칭 시작`);

    const normalizedRecipeName = normalizeString(recipeName);
    console.log(`   정규화된 레시피 재료명: "${normalizedRecipeName}"`);

    const matches: FridgeItem[] = [];

    // 1차: 정확 매칭
    for (const item of fridgeItems) {
      const normalizedFridgeName = normalizeString(item.name);
      if (normalizedFridgeName === normalizedRecipeName) {
        matches.push(item);
        console.log(
          `   ✅ 정확 매칭: ${item.name} ${item.quantity}${item.unit}`,
        );
      }
    }

    // 2차: 부분 매칭 (정확 매칭이 없을 때만)
    if (matches.length === 0) {
      for (const item of fridgeItems) {
        const normalizedFridgeName = normalizeString(item.name);
        if (
          normalizedFridgeName.includes(normalizedRecipeName) ||
          normalizedRecipeName.includes(normalizedFridgeName)
        ) {
          matches.push(item);
          console.log(
            `   ✅ 부분 매칭: ${item.name} ${item.quantity}${item.unit}`,
          );
        }
      }
    }

    // 3차: 키워드 매칭 (이전 매칭이 없을 때만)
    if (matches.length === 0) {
      const recipeKeywords = recipeName.toLowerCase().split(/[\s,]+/);
      for (const item of fridgeItems) {
        const fridgeKeywords = item.name.toLowerCase().split(/[\s,]+/);

        for (const recipeKeyword of recipeKeywords) {
          for (const fridgeKeyword of fridgeKeywords) {
            if (
              recipeKeyword.length > 1 &&
              fridgeKeyword.length > 1 &&
              (recipeKeyword.includes(fridgeKeyword) ||
                fridgeKeyword.includes(recipeKeyword))
            ) {
              if (!matches.find(m => m.id === item.id)) {
                matches.push(item);
                console.log(
                  `   ✅ 키워드 매칭: ${item.name} ${item.quantity}${item.unit}`,
                );
              }
            }
          }
        }
      }
    }

    console.log(`   📋 총 ${matches.length}개 옵션 발견`);
    return matches;
  };

  // 🔧 냉장고 식재료와 레시피 재료 매칭 (카드 분리 방식)
  const loadFridgeIngredients = async () => {
    try {
      setIsLoading(true);

      console.log('🔧 fridgeId:', fridgeId);
      const stringFridgeId = fridgeId.toString();

      // 냉장고 재료 가져오기
      const fridgeIngredients = await getFridgeItemsByFridgeId(stringFridgeId);
      console.log('🔍 냉장고 식재료 목록:', fridgeIngredients.length, '개');

      // 레시피에 ingredients가 없는 경우 처리
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        console.warn('⚠️ 레시피에 재료 정보가 없습니다');
        setMatchedIngredients([]);
        setCompletedSteps(new Array(getStepsArray().length).fill(false));
        return;
      }

      // 🔧 각 레시피 재료별로 모든 매칭 옵션을 개별 카드로 변환
      const matched: MatchedIngredientSeparate[] = [];

      recipe.ingredients.forEach(recipeIng => {
        const fridgeOptions = findAllMatches(recipeIng.name, fridgeIngredients);

        if (fridgeOptions.length === 0) {
          // 매칭되는 재료가 없는 경우 - 하나의 빈 카드
          matched.push({
            recipeIngredient: recipeIng,
            fridgeIngredient: null,
            isAvailable: false,
            userInputQuantity: '0',
            maxUserQuantity: 0,
            isDeducted: false,
          });
        } else {
          // 🔧 각 옵션을 별도 카드로 생성
          fridgeOptions.forEach((option, index) => {
            const recipeQuantity = parseFloat(recipeIng.quantity) || 1;
            const availableQuantity = parseFloat(option.quantity) || 1;

            matched.push({
              recipeIngredient: recipeIng,
              fridgeIngredient: option,
              isAvailable: true,
              userInputQuantity: '0', // 🔧 항상 0으로 시작
              maxUserQuantity: availableQuantity,
              isDeducted: false,
              isMultipleOption: fridgeOptions.length > 1,
              optionIndex: index + 1,
            });
          });
        }
      });

      console.log('🔧 생성된 카드 수:', matched.length);
      setMatchedIngredients(matched);
      setCompletedSteps(new Array(getStepsArray().length).fill(false));
    } catch (error) {
      console.error('❌ 냉장고 재료 로드 실패:', error);
      Alert.alert('오류', '냉장고 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Steps 배열로 변환 (안전한 처리)
  const getStepsArray = () => {
    if (!recipe.steps) {
      console.log('⚠️ recipe.steps가 없습니다:', recipe.steps);
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

    console.warn(
      '⚠️ recipe.steps가 예상치 못한 타입입니다:',
      typeof recipe.steps,
      recipe.steps,
    );
    return [];
  };

  // 단계 완료 토글
  const toggleStepCompletion = (index: number) => {
    setCompletedSteps(prev => {
      const newSteps = [...prev];
      newSteps[index] = !newSteps[index];
      return newSteps;
    });
  };

  // 사용할 수량 입력
  const updateUserQuantity = (index: number, quantity: string) => {
    setMatchedIngredients(prev => {
      const updated = [...prev];
      updated[index].userInputQuantity = quantity;
      return updated;
    });
  };

  // 슬라이더 최대값 업데이트
  const updateMaxUserQuantity = (index: number, newMaxQuantity: number) => {
    setMatchedIngredients(prev => {
      const updated = [...prev];
      updated[index].maxUserQuantity = newMaxQuantity;
      return updated;
    });
  };

  // 🔧 재료 차감하기 (단순화됨)
  const deductIngredient = async (index: number) => {
    const ingredient = matchedIngredients[index];

    if (!ingredient.isAvailable || !ingredient.fridgeIngredient) {
      Alert.alert('알림', '냉장고에 없는 재료입니다.');
      return;
    }

    if (
      !ingredient.userInputQuantity.trim() ||
      ingredient.userInputQuantity === '0' ||
      parseFloat(ingredient.userInputQuantity) <= 0
    ) {
      Alert.alert('알림', '차감할 수량을 입력해주세요.');
      return;
    }

    const inputQuantity = parseFloat(ingredient.userInputQuantity);
    const currentQuantity = parseFloat(ingredient.fridgeIngredient.quantity);

    if (isNaN(inputQuantity) || inputQuantity <= 0) {
      Alert.alert('알림', '올바른 수량을 입력해주세요.');
      return;
    }

    if (inputQuantity > currentQuantity) {
      Alert.alert(
        '수량 부족',
        `${ingredient.fridgeIngredient.name}은 ${currentQuantity}${
          ingredient.fridgeIngredient.unit || '개'
        }만 있습니다.`,
      );
      return;
    }

    Alert.alert(
      '재료 차감',
      `${ingredient.fridgeIngredient.name} ${inputQuantity}${
        ingredient.fridgeIngredient.unit || '개'
      }를 차감하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '차감',
          onPress: async () => {
            try {
              const newQuantity = currentQuantity - inputQuantity;

              await updateFridgeItem(
                parseInt(ingredient.fridgeIngredient!.id),
                {
                  quantity: newQuantity.toString(),
                },
              );

              setMatchedIngredients(prev => {
                const updated = [...prev];
                updated[index].isDeducted = true;
                if (updated[index].fridgeIngredient) {
                  updated[index].fridgeIngredient!.quantity =
                    newQuantity.toString();
                }
                return updated;
              });

              Alert.alert(
                '완료',
                `${ingredient.fridgeIngredient.name}이(가) ${inputQuantity}${
                  ingredient.fridgeIngredient.unit || '개'
                } 차감되었습니다.`,
              );
            } catch (error) {
              console.error('재료 차감 실패:', error);
              Alert.alert('오류', '재료 차감에 실패했습니다.');
            }
          },
        },
      ],
    );
  };

  // 조리 완료
  const completeRecipe = () => {
    const completedStepsCount = completedSteps.filter(Boolean).length;
    const totalSteps = getStepsArray().length;
    const deductedIngredientsCount = matchedIngredients.filter(
      item => item.isDeducted,
    ).length;

    Alert.alert(
      '조리 완료',
      `${completedStepsCount}/${totalSteps} 단계 완료\n${deductedIngredientsCount}개의 재료 차감\n\n조리를 완료하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '완료',
          onPress: () => {
            Alert.alert(
              '축하합니다! 🎉',
              `${recipe.title} 조리가 완료되었습니다.`,
              [
                {
                  text: '확인',
                  onPress: () => navigation.goBack(),
                },
              ],
            );
          },
        },
      ],
    );
  };

  // 🔧 재료 아이템 렌더링 (카드 분리 방식)
  const renderIngredientItem = ({
    item,
    index,
  }: {
    item: MatchedIngredientSeparate;
    index: number;
  }) => (
    <View style={styles.ingredientCard}>
      <View style={styles.ingredientHeader}>
        <View style={styles.ingredientNameContainer}>
          <Text style={styles.ingredientName}>
            {item.recipeIngredient.name}
            {/* 🔧 여러 옵션 중 하나인 경우 배지 표시 */}
            {item.isMultipleOption && (
              <Text style={styles.optionBadge}> #{item.optionIndex}</Text>
            )}
          </Text>
          {/* 🔧 구체적인 아이템명 표시 (레시피명과 다른 경우) */}
          {item.fridgeIngredient &&
            item.fridgeIngredient.name !== item.recipeIngredient.name && (
              <Text style={styles.optionDescription}>
                {item.fridgeIngredient.name}
              </Text>
            )}
        </View>
        <Text style={styles.recipeQuantity}>
          필요: {item.recipeIngredient.quantity}
        </Text>
      </View>

      {item.isAvailable && item.fridgeIngredient ? (
        <View style={styles.availableIngredient}>
          <Text style={styles.availableText}>
            ✅ 보유: {item.fridgeIngredient.quantity}
            {item.fridgeIngredient.unit}
          </Text>

          <View style={styles.quantityEditorContainer}>
            <Text style={styles.quantityLabel}>사용할 수량:</Text>
            <SliderQuantityInput
              quantity={item.userInputQuantity}
              unit={item.fridgeIngredient.unit || '개'}
              maxQuantity={item.maxUserQuantity}
              availableQuantity={parseFloat(item.fridgeIngredient.quantity)}
              isEditMode={!item.isDeducted}
              onQuantityChange={quantity => updateUserQuantity(index, quantity)}
              onMaxQuantityChange={maxQuantity =>
                updateMaxUserQuantity(index, maxQuantity)
              }
              onTextBlur={() => {}}
            />
          </View>

          <View style={styles.deductionRow}>
            <TouchableOpacity
              style={[
                styles.deductButton,
                item.isDeducted && styles.deductButtonCompleted,
              ]}
              onPress={() => deductIngredient(index)}
              disabled={item.isDeducted}
            >
              <Icon
                name={
                  item.isDeducted ? 'check-circle' : 'remove-circle-outline'
                }
                size={24}
                color={item.isDeducted ? '#4CAF50' : '#FF5722'}
              />
              <Text
                style={[
                  styles.deductButtonText,
                  item.isDeducted && styles.deductButtonTextCompleted,
                ]}
              >
                {item.isDeducted ? '차감 완료' : '차감하기'}
              </Text>
            </TouchableOpacity>
          </View>

          {item.isDeducted && (
            <Text style={styles.deductedText}>
              ✓ {item.userInputQuantity}
              {item.fridgeIngredient.unit || '개'} 차감 완료
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.unavailableIngredient}>
          <Text style={styles.unavailableText}>❌ 냉장고에 없음</Text>
        </View>
      )}
    </View>
  );

  // Steps 렌더링
  const renderSteps = () => {
    const steps = getStepsArray();

    return (
      <View style={styles.stepsContainer}>
        <Text style={styles.sectionTitle}>조리 과정</Text>
        {steps.map((step, index) => {
          const cleanStep = step.replace(/^\d+\.\s*/, '');
          const isCompleted = completedSteps[index] || false;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.stepCard, isCompleted && styles.stepCardCompleted]}
              onPress={() => toggleStepCompletion(index)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.stepCheckbox,
                  isCompleted && styles.stepCheckboxCompleted,
                ]}
              >
                {isCompleted ? (
                  <Icon name="check" size={16} color="#fff" />
                ) : (
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                )}
              </View>
              <View style={styles.stepContent}>
                <Text
                  style={[
                    styles.stepText,
                    isCompleted && styles.stepTextCompleted,
                  ]}
                >
                  {cleanStep}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* 진행률 표시 */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            진행률: {completedSteps.filter(Boolean).length}/{steps.length} 단계
            완료
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    (completedSteps.filter(Boolean).length / steps.length) * 100
                  }%`,
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>냉장고 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>조리하기</Text>

        <TouchableOpacity style={styles.menuButton}>
          <MaterialIcons name="more-vert" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 레시피 제목 */}
        <Text style={styles.recipeTitle}>{recipe.title}</Text>

        {/* 안내사항 */}
        <View style={styles.noticeContainer}>
          <View style={styles.noticeHeader}>
            <Icon name="info-outline" size={20} color="#1976d2" />
            <Text style={styles.noticeTitle}>사용 안내</Text>
          </View>
          <Text style={styles.noticeText}>
            • 같은 재료가 여러 종류 있으면 각각 별도 카드로 표시됩니다{'\n'}•
            슬라이더나 직접 입력으로 사용할 수량을 조절하세요{'\n'}• 보유량을
            초과하면 전체 사용 옵션이 제공됩니다{'\n'}• 차감된 재료는 냉장고에서
            즉시 반영됩니다
          </Text>
        </View>

        {/* 재료 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>재료 준비</Text>
          <FlatList
            data={matchedIngredients}
            renderItem={renderIngredientItem}
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* 조리 과정 섹션 */}
        <View style={styles.section}>{renderSteps()}</View>

        {/* 조리 완료 버튼 */}
        <TouchableOpacity
          style={styles.completeButton}
          onPress={completeRecipe}
        >
          <Icon name="restaurant" size={20} color="#fff" />
          <Text style={styles.completeButtonText}>조리 완료하기</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default UseRecipeScreen;
