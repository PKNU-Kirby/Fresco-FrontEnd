// screens/recipe/UseRecipeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import InfoModal from '../../../components/UseRecipe/InfoModal';
import IngredientCard from '../../../components/UseRecipe/IngredientCard';
import StepsSection from '../../../components/UseRecipe/StepsSection';
import ConfirmModal from '../../../components/modals/ConfirmModal';

import { updateFridgeItem } from '../../../utils/fridgeStorage';
import { useIngredientMatching } from '../../../hooks/Recipe/useIngredientMatching';
import { useRecipeSteps } from '../../../hooks/Recipe/useRecipeSteps';
import { RecipeStackParamList } from '../../../types';

import { styles } from './styles';

type UseRecipeScreenNavigationProp = NativeStackNavigationProp<
  RecipeStackParamList,
  'UseRecipe'
>;
type UseRecipeScreenRouteProp = RouteProp<RecipeStackParamList, 'UseRecipe'>;

const UseRecipeScreen: React.FC = () => {
  const navigation = useNavigation<UseRecipeScreenNavigationProp>();
  const route = useRoute<UseRecipeScreenRouteProp>();
  const { recipe, fridgeId } = route.params;

  // 모달 상태 관리 (간소화됨)
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showCompleteConfirmModal, setShowCompleteConfirmModal] =
    useState(false);
  const [showCompleteSuccessModal, setShowCompleteSuccessModal] =
    useState(false);
  const [showCompleteErrorModal, setShowCompleteErrorModal] = useState(false);

  // 조리 완료 정보
  const [completeInfo, setCompleteInfo] = useState({
    completed: 0,
    total: 0,
    ingredientsToDeduct: [] as any[],
    totalDeductCount: 0,
  });
  const [errorMessage, setErrorMessage] = useState('');

  const {
    matchedIngredients,
    isLoading,
    updateUserQuantity,
    updateMaxUserQuantity,
    loadIngredients,
    setMatchedIngredients,
  } = useIngredientMatching(recipe, fridgeId);

  const { completedSteps, toggleStepCompletion, getStepsArray } =
    useRecipeSteps(recipe);

  // 초기 데이터 로드
  useEffect(() => {
    loadIngredients();
  }, [loadIngredients]);

  // 🔧 조리 완료 및 일괄 차감
  const completeRecipe = () => {
    const completedStepsCount = completedSteps.filter(Boolean).length;
    const totalSteps = getStepsArray.length;

    // 차감할 재료들 필터링 (입력량이 0보다 큰 것들만)
    const ingredientsToDeduct = matchedIngredients.filter(
      item =>
        item.isAvailable &&
        item.fridgeIngredient &&
        parseFloat(item.userInputQuantity) > 0,
    );

    // 유효성 검사 - 수량 초과 여부 확인
    const invalidIngredients = ingredientsToDeduct.filter(item => {
      const inputQuantity = parseFloat(item.userInputQuantity);
      const availableQuantity = parseFloat(item.fridgeIngredient!.quantity);
      return inputQuantity > availableQuantity;
    });

    if (invalidIngredients.length > 0) {
      const firstInvalid = invalidIngredients[0];
      setErrorMessage(
        `${firstInvalid.fridgeIngredient!.name}의 수량이 부족합니다.\n` +
          `입력: ${firstInvalid.userInputQuantity}${
            firstInvalid.fridgeIngredient!.unit || '개'
          }\n` +
          `보유: ${firstInvalid.fridgeIngredient!.quantity}${
            firstInvalid.fridgeIngredient!.unit || '개'
          }`,
      );
      setShowCompleteErrorModal(true);
      return;
    }

    setCompleteInfo({
      completed: completedStepsCount,
      total: totalSteps,
      ingredientsToDeduct,
      totalDeductCount: ingredientsToDeduct.length,
    });
    setShowCompleteConfirmModal(true);
  };

  // 🔧 일괄 차감 실행
  const handleCompleteConfirm = async () => {
    setShowCompleteConfirmModal(false);

    try {
      // 모든 재료를 순차적으로 차감
      for (const ingredient of completeInfo.ingredientsToDeduct) {
        const inputQuantity = parseFloat(ingredient.userInputQuantity);
        const currentQuantity = parseFloat(
          ingredient.fridgeIngredient!.quantity,
        );
        const newQuantity = currentQuantity - inputQuantity;

        await updateFridgeItem(ingredient.fridgeIngredient!.id, {
          quantity: newQuantity.toString(),
        });
      }

      // UI 상태 업데이트
      setMatchedIngredients(prev => {
        const updated = [...prev];
        completeInfo.ingredientsToDeduct.forEach(ingredient => {
          const index = updated.findIndex(
            item =>
              item.fridgeIngredient?.id === ingredient.fridgeIngredient?.id,
          );
          if (index !== -1) {
            updated[index].isDeducted = true;
            const inputQuantity = parseFloat(ingredient.userInputQuantity);
            const currentQuantity = parseFloat(
              updated[index].fridgeIngredient!.quantity,
            );
            updated[index].fridgeIngredient!.quantity = (
              currentQuantity - inputQuantity
            ).toString();
          }
        });
        return updated;
      });

      setShowCompleteSuccessModal(true);
    } catch (error) {
      console.error('재료 차감 실패:', error);
      setErrorMessage('재료 차감 중 오류가 발생했습니다.');
      setShowCompleteErrorModal(true);
    }
  };

  const handleCompleteSuccess = () => {
    setShowCompleteSuccessModal(false);
    navigation.goBack();
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
        <View style={styles.leftHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerHeader}>
          <Text style={styles.headerTitle}>조리하기</Text>
        </View>
        <View style={styles.rightHeader}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowInfoModal(true)}
          >
            <Icon name="info-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 레시피 제목 */}
        <Text style={styles.recipeTitle}>{recipe.title}</Text>

        {/* 재료 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>재료 준비</Text>
          <FlatList
            data={matchedIngredients}
            renderItem={({ item, index }) => (
              <IngredientCard
                item={item}
                index={index}
                onQuantityChange={updateUserQuantity}
                onMaxQuantityChange={updateMaxUserQuantity}
                // 🔧 onDeduct 제거 (개별 차감 버튼 없앰)
              />
            )}
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* 조리 과정 섹션 */}
        <StepsSection
          steps={getStepsArray}
          completedSteps={completedSteps}
          onToggleStep={toggleStepCompletion}
        />

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

      {/* 안내사항 모달 */}
      <InfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />

      {/* 조리 완료 확인 (재료 차감 포함) */}
      <ConfirmModal
        isAlert={true}
        visible={showCompleteConfirmModal}
        title="조리 완료"
        message={`${completeInfo.completed}/${completeInfo.total} 단계 완료\n${completeInfo.totalDeductCount}개 재료 차감 예정\n\n조리를 완료하시겠습니까?`}
        iconContainer={{ backgroundColor: '#d3f0d3' }}
        icon={{ name: 'restaurant', color: 'limegreen', size: 48 }}
        confirmText="완료"
        cancelText="취소"
        confirmButtonStyle="primary"
        onConfirm={handleCompleteConfirm}
        onCancel={() => setShowCompleteConfirmModal(false)}
      />

      {/* 조리 완료 성공 */}
      <ConfirmModal
        isAlert={false}
        visible={showCompleteSuccessModal}
        title="맛있게 드세요!"
        message={`${recipe.title} 조리가 완료되었습니다.`}
        iconContainer={{ backgroundColor: '#d3f0d3' }}
        icon={{ name: 'restaurant', color: 'limegreen', size: 48 }}
        confirmText="확인"
        onConfirm={handleCompleteSuccess}
        onCancel={handleCompleteSuccess}
      />

      {/* 오류 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={showCompleteErrorModal}
        title="오류"
        message={errorMessage}
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{ name: 'error', color: 'tomato', size: 48 }}
        confirmText="확인"
        onConfirm={() => setShowCompleteErrorModal(false)}
        onCancel={() => setShowCompleteErrorModal(false)}
      />
    </SafeAreaView>
  );
};

export default UseRecipeScreen;
