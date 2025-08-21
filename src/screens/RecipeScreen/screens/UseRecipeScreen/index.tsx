// screens/recipe/UseRecipeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Recipe, RecipeStackParamList } from '../../RecipeNavigator';

// FridgeStorage를 직접 import 대신 fridgeStorage.tsx 사용
import {
  getFridgeItemsByFridgeId,
  updateFridgeItem,
  FridgeItem,
} from '../../../../utils/fridgeStorage';
import { styles } from './styles';
// FridgeItem 타입 정의 (FridgeItemList와 동일하게 맞춤)
interface FridgeItem {
  id: string;
  fridgeId: string;
  name: string;
  quantity: string;
  expiryDate: string;
  imageUri?: string;
  itemCategory: string;
  unit?: string;
}

// 레시피 재료와 냉장고 재료 매칭 타입
interface MatchedIngredient {
  recipeIngredient: {
    name: string;
    quantity: string;
  };
  fridgeIngredient?: FridgeItem;
  isAvailable: boolean;
  userInputQuantity: string;
  isDeducted: boolean;
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

  // 상태 관리
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const [matchedIngredients, setMatchedIngredients] = useState<
    MatchedIngredient[]
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

  const findBestMatch = (
    recipeName: string,
    fridgeItems: FridgeItem[],
  ): FridgeItem | null => {
    console.log(`🔍 "${recipeName}" 매칭 시작`);

    const normalizedRecipeName = normalizeString(recipeName);
    console.log(`   정규화된 레시피 재료명: "${normalizedRecipeName}"`);

    // 1차: 정확 매칭 (정규화 후)
    for (const item of fridgeItems) {
      const normalizedFridgeName = normalizeString(item.name);
      console.log(
        `   비교: "${normalizedFridgeName}" vs "${normalizedRecipeName}"`,
      );

      if (normalizedFridgeName === normalizedRecipeName) {
        console.log(`   ✅ 정확 매칭 성공: ${item.name}`);
        return item;
      }
    }

    // 2차: 부분 매칭 (포함 관계)
    for (const item of fridgeItems) {
      const normalizedFridgeName = normalizeString(item.name);

      if (
        normalizedFridgeName.includes(normalizedRecipeName) ||
        normalizedRecipeName.includes(normalizedFridgeName)
      ) {
        console.log(`   ✅ 부분 매칭 성공: ${item.name}`);
        return item;
      }
    }

    // 3차: 유사 매칭 (키워드 기반)
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
            console.log(
              `   ✅ 키워드 매칭 성공: ${item.name} (키워드: ${recipeKeyword} ↔ ${fridgeKeyword})`,
            );
            return item;
          }
        }
      }
    }

    console.log(`   ❌ 매칭 실패`);
    return null;
  };

  // 냉장고 식재료와 레시피 재료 매칭
  const loadFridgeIngredients = async () => {
    try {
      setIsLoading(true);

      console.log('🔧 fridgeId 타입 및 값:', typeof fridgeId, fridgeId);

      // fridgeId를 string으로 변환
      const stringFridgeId = fridgeId.toString();

      // fridgeStorage.tsx의 함수 사용 (FridgeItemList와 동일한 저장소)
      console.log('🔧 string fridgeId:', stringFridgeId);

      // 먼저 모든 아이템을 직접 확인해보기
      const { getFridgeItems } = await import(
        '../../../../utils/fridgeStorage'
      );
      const allFridgeItems = await getFridgeItems();
      console.log('🔍 getFridgeItems()로 가져온 전체 아이템:', allFridgeItems);
      console.log('🔍 전체 아이템 수:', allFridgeItems.length);
      console.log(
        '🔍 각 아이템의 fridgeId:',
        allFridgeItems.map(
          item =>
            `${item.name}: fridgeId="${
              item.fridgeId
            }" (타입: ${typeof item.fridgeId})`,
        ),
      );

      // 수동으로 필터링해서 확인
      const manualFilter = allFridgeItems.filter(item => {
        const stringComparison = item.fridgeId === stringFridgeId;
        const numberComparison = item.fridgeId === fridgeId;
        const mixedComparison1 = item.fridgeId.toString() === stringFridgeId;
        const mixedComparison2 =
          parseInt(item.fridgeId.toString()) === fridgeId;

        console.log(`🔍 ${item.name} 필터링:`);
        console.log(
          `   item.fridgeId: ${item.fridgeId} (${typeof item.fridgeId})`,
        );
        console.log(
          `   target: "${stringFridgeId}" (string) / ${fridgeId} (number)`,
        );
        console.log(`   string === string: ${stringComparison}`);
        console.log(`   original === number: ${numberComparison}`);
        console.log(`   toString === string: ${mixedComparison1}`);
        console.log(`   parseInt === number: ${mixedComparison2}`);

        return (
          stringComparison ||
          numberComparison ||
          mixedComparison1 ||
          mixedComparison2
        );
      });

      console.log('🔍 수동 필터링 결과:', manualFilter.length, '개');

      // fridgeStorage.tsx 함수 사용 (실제 데이터가 있는 저장소)
      const fridgeIngredients = await getFridgeItemsByFridgeId(stringFridgeId);

      console.log(
        '🔍 getFridgeItemsByFridgeId()로 가져온 아이템 수:',
        fridgeIngredients.length,
      );
      console.log(
        '🔍 냉장고 식재료 목록:',
        fridgeIngredients.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          fridgeId: item.fridgeId,
        })),
      );

      console.log('🔍 레시피 재료 개수:', recipe.ingredients?.length || 0);
      console.log(
        '🔍 레시피 재료 목록:',
        recipe.ingredients?.map(ing => ({
          name: ing.name,
          quantity: ing.quantity,
        })) || [],
      );

      // 레시피에 ingredients가 없는 경우 처리
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        console.warn('⚠️ 레시피에 재료 정보가 없습니다');
        setMatchedIngredients([]);
        setCompletedSteps(new Array(getStepsArray().length).fill(false));
        return;
      }

      // 레시피 재료와 냉장고 재료 매칭
      const matched: MatchedIngredient[] = recipe.ingredients.map(
        (recipeIng, index) => {
          console.log(
            `\n🔍 매칭 ${index + 1}/${recipe.ingredients.length}: "${
              recipeIng.name
            }"`,
          );

          const fridgeIng = findBestMatch(recipeIng.name, fridgeIngredients);

          // quantity를 숫자로 파싱해서 확인
          const fridgeQuantity = fridgeIng
            ? parseFloat(fridgeIng.quantity) || 0
            : 0;
          console.log(`   매칭된 재료 수량:`, fridgeQuantity);

          const result = {
            recipeIngredient: recipeIng,
            fridgeIngredient: fridgeIng || undefined,
            isAvailable: !!fridgeIng && fridgeQuantity > 0,
            userInputQuantity: '',
            isDeducted: false,
          };

          console.log(
            `   최종 매칭 결과:`,
            result.isAvailable ? '✅ 있음' : '❌ 없음',
          );
          if (fridgeIng) {
            console.log(`   매칭된 아이템:`, {
              name: fridgeIng.name,
              quantity: fridgeIng.quantity,
              unit: fridgeIng.unit,
            });
          }

          return result;
        },
      );

      console.log('🔍 전체 매칭 결과 요약:');
      matched.forEach((match, index) => {
        console.log(
          `   ${index + 1}. ${match.recipeIngredient.name} → ${
            match.isAvailable ? `✅ ${match.fridgeIngredient?.name}` : '❌ 없음'
          }`,
        );
      });

      setMatchedIngredients(matched);
      setCompletedSteps(new Array(getStepsArray().length).fill(false));
    } catch (error) {
      console.error('❌ 냉장고 재료 로드 실패:', error);
      Alert.alert('오류', '냉장고 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Steps 배열로 변환
  const getStepsArray = () => {
    if (!recipe.steps) return [];

    if (Array.isArray(recipe.steps)) {
      return recipe.steps.filter(step => step && step.trim().length > 0);
    }

    return recipe.steps
      .split('\n')
      .map(step => step.trim())
      .filter(step => step.length > 0);
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

  // 재료 차감하기
  const deductIngredient = async (index: number) => {
    const ingredient = matchedIngredients[index];

    if (!ingredient.isAvailable || !ingredient.fridgeIngredient) {
      Alert.alert('알림', '냉장고에 없는 재료입니다.');
      return;
    }

    if (!ingredient.userInputQuantity.trim()) {
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
        `냉장고에 ${currentQuantity}${
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
              const updatedItem = {
                ...ingredient.fridgeIngredient!,
                quantity: newQuantity.toString(),
              };

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

  // 재료 아이템 렌더링
  const renderIngredientItem = ({
    item,
    index,
  }: {
    item: MatchedIngredient;
    index: number;
  }) => (
    <View style={styles.ingredientCard}>
      <View style={styles.ingredientHeader}>
        <Text style={styles.ingredientName}>{item.recipeIngredient.name}</Text>
        <Text style={styles.recipeQuantity}>
          필요: {item.recipeIngredient.quantity}
        </Text>
      </View>

      {item.isAvailable && item.fridgeIngredient ? (
        <View style={styles.availableIngredient}>
          <Text style={styles.availableText}>
            ✅ 보유: {item.fridgeIngredient.quantity}
            {item.fridgeIngredient.unit || '개'}
          </Text>
          <View style={styles.deductionRow}>
            <TextInput
              style={styles.quantityInput}
              value={item.userInputQuantity}
              onChangeText={text => updateUserQuantity(index, text)}
              placeholder={`${item.fridgeIngredient.unit || '개'} 단위로 입력`}
              keyboardType="numeric"
              editable={!item.isDeducted}
            />
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

          {/* 상세 디버깅 정보 버튼 */}
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => {
              const fridgeItemNames =
                matchedIngredients
                  .map(m => m.fridgeIngredient?.name)
                  .filter(Boolean)
                  .join(', ') || '없음';

              const debugInfo = `
레시피 재료: "${item.recipeIngredient.name}"
정규화된 이름: "${normalizeString(item.recipeIngredient.name)}"

냉장고에 있는 재료들:
${fridgeItemNames}

매칭 실패 이유를 확인하세요.
              `.trim();

              Alert.alert('디버깅 정보', debugInfo);
            }}
          >
            <Text style={styles.debugButtonText}>🔍 매칭 정보 보기</Text>
          </TouchableOpacity>
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

        {/* 디버깅 정보 섹션 */}
        <TouchableOpacity
          style={styles.debugSection}
          onPress={() => {
            const debugInfo = `
fridgeId: ${fridgeId} (타입: ${typeof fridgeId})
레시피 재료 수: ${recipe.ingredients?.length || 0}
매칭된 재료 수: ${matchedIngredients.length}
사용 가능한 재료 수: ${matchedIngredients.filter(m => m.isAvailable).length}

콘솔에서 더 자세한 로그를 확인하세요.
            `.trim();
            Alert.alert('디버깅 정보', debugInfo);
          }}
        >
          <Text style={styles.debugSectionText}>🔧 디버깅 정보 보기</Text>
        </TouchableOpacity>

        {/* 안내사항 */}
        <View style={styles.noticeContainer}>
          <View style={styles.noticeHeader}>
            <Icon name="info-outline" size={20} color="#1976d2" />
            <Text style={styles.noticeTitle}>사용 안내</Text>
          </View>
          <Text style={styles.noticeText}>
            • 사용한 식재료는 사용한 만큼 정확히 입력해주세요{'\n'}• 식재료
            단위는 냉장고에 등록된 단위로 차감됩니다{'\n'}• 차감된 재료는
            냉장고에서 즉시 반영됩니다
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
