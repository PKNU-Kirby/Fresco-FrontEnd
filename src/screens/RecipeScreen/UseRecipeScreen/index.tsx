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
import StepsSection from '../../../components/UseRecipe/StepsSection';
import ConfirmModal from '../../../components/modals/ConfirmModal';
import EnhancedIngredientCard from '../../../components/UseRecipe/EnhancedIngredientCard';
import {
  updateFridgeItem,
  deleteItemFromFridge,
} from '../../../utils/fridgeStorage';
import { useIngredientMatching } from '../../../hooks/Recipe/useIngredientMatching';
import { useRecipeSteps } from '../../../hooks/Recipe/useRecipeSteps';
import { RecipeStackParamList, Recipe } from '../../../types';
import { EnhancedIngredient } from '../../../hooks/Recipe/useIngredientMatching';
import { UsageTrackingService } from '../../../services/UsageTrackingService';
import { styles } from './styles';

type UseRecipeScreenNavigationProp = NativeStackNavigationProp<
  RecipeStackParamList,
  'UseRecipe'
>;

type UseRecipeScreenRouteProp = RouteProp<
  {
    UseRecipe: {
      recipe: Recipe;
      fridgeId: number;
      enhancedIngredients?: EnhancedIngredient[];
    };
  },
  'UseRecipe'
>;

const UseRecipeScreen: React.FC = () => {
  const navigation = useNavigation<UseRecipeScreenNavigationProp>();
  const route = useRoute<UseRecipeScreenRouteProp>();
  const { recipe, fridgeId, enhancedIngredients } = route.params;

  // Modal State
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showCompleteConfirmModal, setShowCompleteConfirmModal] =
    useState(false);
  const [showCompleteSuccessModal, setShowCompleteSuccessModal] =
    useState(false);
  const [showCompleteErrorModal, setShowCompleteErrorModal] = useState(false);
  const [completeInfo, setCompleteInfo] = useState({
    completed: 0,
    total: 0,
    ingredientsToDeduct: [] as any[],
    totalDeductCount: 0,
    ingredientsToDelete: [] as any[], // 완전 소진될 재료들
    deleteCount: 0,
  });
  const [errorMessage, setErrorMessage] = useState('');

  const numericFridgeId = fridgeId;

  const {
    matchedIngredients,
    isLoading,
    updateUserQuantity,
    updateMaxUserQuantity,
    loadIngredients,
    loadFromEnhancedIngredients,
    setMatchedIngredients,
  } = useIngredientMatching({ recipe, fridgeId: numericFridgeId });

  const { completedSteps, toggleStepCompletion, getStepsArray } =
    useRecipeSteps(recipe);

  // Initial data load
  useEffect(() => {
    if (enhancedIngredients && enhancedIngredients.length > 0) {
      // 향상된 재료 데이터가 있으면 그것을 사용
      // console.log('향상된 재료 데이터 사용:', enhancedIngredients);
      loadFromEnhancedIngredients(enhancedIngredients);
    } else {
      // 없으면 기존 방식 사용
      // console.log('기존 재료 매칭 방식 사용');
      loadIngredients();
    }
  }, [enhancedIngredients, loadIngredients, loadFromEnhancedIngredients]);

  // 조리 완료 및 일괄 차감
  const completeRecipe = () => {
    const completedStepsCount = completedSteps.filter(Boolean).length;
    const totalSteps = getStepsArray.length;

    // 차감할 재료들 필터링 (입력량이 0보다 큰 것들만)
    const ingredientsToDeduct = matchedIngredients.filter(
      item =>
        item.isAvailable && item.fridgeIngredient && item.userInputQuantity > 0,
    );

    // 유효성 검사 - 수량 초과 여부 확인 (최대값 고려)
    const invalidIngredients = ingredientsToDeduct.filter(item => {
      let inputQuantity = item.userInputQuantity;
      const availableQuantity = item.fridgeIngredient!.quantity;
      const maxQuantity = item.maxUserQuantity;

      // 최대값으로 설정된 경우 정확한 총량으로 처리
      const isMaxQuantity = Math.abs(inputQuantity - maxQuantity) < 0.0001;
      if (isMaxQuantity) {
        inputQuantity = availableQuantity; // 실제 냉장고 수량 사용
      }

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

    // 완전 소진될 재료들 찾기 (정확한 차감량 고려)
    const ingredientsToDelete = ingredientsToDeduct.filter(item => {
      let inputQuantity = item.userInputQuantity;
      const currentQuantity = item.fridgeIngredient!.quantity;
      const maxQuantity = item.maxUserQuantity;

      // 최대값으로 설정된 경우 정확한 총량으로 처리
      const isMaxQuantity = Math.abs(inputQuantity - maxQuantity) < 0.0001;
      if (isMaxQuantity) {
        inputQuantity = currentQuantity;
      }

      const remainingQuantity = currentQuantity - inputQuantity;
      return remainingQuantity <= 0; // 수량이 0 이하가 되는 경우
    });

    /*
    console.log(
      `🗑️ 완전 소진될 재료 ${ingredientsToDelete.length}개:`,
      ingredientsToDelete.map(item => {
        let inputQuantity = item.userInputQuantity;
        const currentQuantity = item.fridgeIngredient!.quantity;
        const maxQuantity = item.maxUserQuantity;
        const isMaxQuantity = Math.abs(inputQuantity - maxQuantity) < 0.0001;
        if (isMaxQuantity) {
          inputQuantity = currentQuantity;
        }
        return `${item.fridgeIngredient!.name} (${
          item.fridgeIngredient!.quantity
        } -> 0, 차감: ${inputQuantity})`;
      }),
    );*/

    setCompleteInfo({
      completed: completedStepsCount,
      total: totalSteps,
      ingredientsToDeduct,
      totalDeductCount: ingredientsToDeduct.length,
      ingredientsToDelete,
      deleteCount: ingredientsToDelete.length,
    });
    setShowCompleteConfirmModal(true);
  };

  // 일괄 차감 실행 (사용 기록 추가 및 완전 소진 재료 삭제)
  const handleCompleteConfirm = async () => {
    setShowCompleteConfirmModal(false);
    try {
      /*
      console.log(
        `🔄 ${completeInfo.ingredientsToDeduct.length}개 재료 처리 시작`,
      );
      */

      // 모든 재료를 순차적으로 처리
      for (const ingredient of completeInfo.ingredientsToDeduct) {
        let inputQuantity = ingredient.userInputQuantity;
        const currentQuantity = ingredient.fridgeIngredient!.quantity;

        // 슬라이더 최대값 또는 스테퍼로 최대값 설정된 경우 정확한 총량으로 처리
        const maxQuantity = ingredient.maxUserQuantity;
        const isMaxQuantity = Math.abs(inputQuantity - maxQuantity) < 0.0001; // 부동소수점 오차 고려

        if (isMaxQuantity) {
          // 최대값으로 설정된 경우 정확한 냉장고 수량을 사용
          inputQuantity = currentQuantity;
          /*
          console.log(
            `🎯 최대값 사용: ${ingredient.fridgeIngredient!.name} - ${
              ingredient.userInputQuantity
            } -> ${inputQuantity} (정확한 총량)`,
          );
          */
        }

        const newQuantity = currentQuantity - inputQuantity;

        /*
        console.log(
          `📦 ${
            ingredient.fridgeIngredient!.name
          }: ${currentQuantity} -> ${newQuantity} (차감: ${inputQuantity})`,
        );
        */

        // 레시피 사용 기록 추가 (삭제 전에 먼저 기록)
        const isCompletelyConsumed = newQuantity <= 0;
        await UsageTrackingService.trackRecipeUsage(
          ingredient.fridgeIngredient!.id,
          ingredient.fridgeIngredient!.name,
          inputQuantity,
          ingredient.fridgeIngredient!.unit || '개',
          fridgeId,
          recipe.title, // 완전 소진 여부 기록
          isCompletelyConsumed ? '완전소진' : undefined,
        );

        if (isCompletelyConsumed) {
          await deleteItemFromFridge(ingredient.fridgeIngredient!.id);
        } else {
          // 수량만 업데이트
          const finalQuantity = Math.max(0, newQuantity);
          await updateFridgeItem(ingredient.fridgeIngredient!.id, {
            quantity: finalQuantity,
          });
        }
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
            const inputQuantity = ingredient.userInputQuantity;
            const currentQuantity = updated[index].fridgeIngredient!.quantity;

            const newQuantity = currentQuantity - inputQuantity;

            if (newQuantity <= 0) {
              // 완전 소진된 경우 UI에서 표시 변경
              updated[index].fridgeIngredient!.quantity = 0;
              updated[index].isCompletelyConsumed = true;
            } else {
              updated[index].fridgeIngredient!.quantity = newQuantity;
            }
          }
        });
        return updated;
      });

      setShowCompleteSuccessModal(true);
    } catch (error) {
      // console.error('재료 차감/삭제 실패:', error);
      setErrorMessage('재료 처리 중 오류가 발생했습니다.');
      setShowCompleteErrorModal(true);
    }
  };

  const handleCompleteSuccess = () => {
    setShowCompleteSuccessModal(false);
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text>냉장고 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            style={styles.infoButton}
            onPress={() => setShowInfoModal(true)}
          >
            <Icon name="info-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 레시피 제목 */}
        <Text style={styles.recipeTitle}>{recipe.title}</Text>

        {/* 재료 섹션 - EnhancedIngredientCard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>재료 준비하기</Text>
          {matchedIngredients.length === 0 ? (
            <View>
              <Icon name="info" size={24} color="#666" />
              <Text>표시할 재료가 없습니다.</Text>
              <Text>레시피 상세 화면에서 재료를 선택해주세요.</Text>
            </View>
          ) : (
            <FlatList
              data={matchedIngredients}
              renderItem={({ item, index }) => (
                <EnhancedIngredientCard
                  item={item}
                  index={index}
                  onQuantityChange={updateUserQuantity}
                  onMaxQuantityChange={updateMaxUserQuantity}
                  fridgeId={numericFridgeId}
                />
              )}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* 조리 과정 섹션 */}
        <StepsSection
          steps={getStepsArray}
          completedSteps={completedSteps}
          onToggleStep={toggleStepCompletion}
        />

        {/* 조리 완료 버튼 */}
        <TouchableOpacity
          style={[
            matchedIngredients.length === 0
              ? styles.disabledButton
              : styles.completeButton,
          ]}
          onPress={completeRecipe}
          disabled={matchedIngredients.length === 0}
        >
          <Icon name="restaurant" size={20} color="#f8f8f8" />
          <Text style={styles.completeButtonText}>조리 완료하기</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 안내사항 모달 */}
      <InfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />

      {/* 조리 완료 확인 (재료 차감 및 삭제 포함) */}
      <ConfirmModal
        isAlert={true}
        visible={showCompleteConfirmModal}
        title="조리 완료"
        message={`${completeInfo.completed}/${completeInfo.total} 단계 완료\n${
          completeInfo.totalDeductCount
        }개 재료 차감 예정${
          completeInfo.deleteCount > 0
            ? `\n${completeInfo.deleteCount}개 재료 삭제 예정`
            : ''
        }\n\n조리를 완료하시겠습니까?`}
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
        message={`${recipe.title} 조리가 완료되었습니다.${
          completeInfo.deleteCount > 0
            ? `\n${completeInfo.deleteCount}개의 재료가 완전 소진되었습니다.`
            : ''
        }`}
        iconContainer={{ backgroundColor: '#d3f0d3' }}
        icon={{ name: 'restaurant', color: 'limegreen', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={handleCompleteSuccess}
        onCancel={handleCompleteSuccess}
      />

      {/* 조리 완료 오류 */}
      <ConfirmModal
        isAlert={false}
        visible={showCompleteErrorModal}
        title="오류"
        message={errorMessage}
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={() => setShowCompleteErrorModal(false)}
        onCancel={() => setShowCompleteErrorModal(false)}
      />
    </SafeAreaView>
  );
};

export default UseRecipeScreen;
