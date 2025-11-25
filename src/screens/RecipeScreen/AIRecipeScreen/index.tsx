import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AsyncStorageService } from '../../../services/AsyncStorageService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ConfirmModal from '../../../components/modals/ConfirmModal';
import { RecipeStackParamList } from '../RecipeNavigator';
import RecipeAPI from '../../../services/API/RecipeAPI';
import { styles } from './styles';

type AIRecipeScreenNavigationProp = NativeStackNavigationProp<
  RecipeStackParamList,
  'AIRecipe'
>;

interface RecipeIngredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

interface AIGeneratedRecipe {
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  referenceUrl?: string;
  substitutions?: Array<{
    original: string;
    substitute: string;
  }>;
}

const AIRecipeScreen: React.FC = () => {
  const navigation = useNavigation<AIRecipeScreenNavigationProp>();

  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] =
    useState<AIGeneratedRecipe | null>(null);
  const [promptHistory, setPromptHistory] = useState<string[]>([
    '김치와 돼지고기로 간단한 요리',
    '달걀 요리 추천해줘',
    '10분 안에 만들 수 있는 요리',
  ]);

  // ConfirmModal 상태들
  const [emptyPromptModalVisible, setEmptyPromptModalVisible] = useState(false);
  const [generateErrorModalVisible, setGenerateErrorModalVisible] =
    useState(false);
  const [generateErrorMessage, setGenerateErrorMessage] = useState('');
  const [saveConfirmVisible, setSaveConfirmVisible] = useState(false);
  const [saveSuccessVisible, setSaveSuccessVisible] = useState(false);
  const [saveErrorModalVisible, setSaveErrorModalVisible] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState('');

  /*
  console.log('🔍 렌더링 상태:', {
    isLoading,
    hasGeneratedRecipe: !!generatedRecipe,
    generatedRecipe,
    prompt,
  });
  */

  // AI 레시피 생성
  const generateRecipe = async () => {
    if (!prompt.trim()) {
      setEmptyPromptModalVisible(true);
      return;
    }

    setIsLoading(true);

    // 프롬프트 히스토리 업데이트
    const newHistory = [
      prompt,
      ...promptHistory.filter(h => h !== prompt),
    ].slice(0, 6);
    setPromptHistory(newHistory);

    try {
      // console.log('📤 AI 레시피 요청:', prompt);

      const aiRecipeData = await RecipeAPI.getAIRecipe(prompt);

      const mappedRecipe: AIGeneratedRecipe = {
        title: aiRecipeData.title,
        description: `AI가 추천하는 "${prompt}" 레시피입니다.`,
        ingredients: aiRecipeData.ingredients.map((ing, index) => ({
          id: `${Date.now()}_${Math.random()}_${index}`,
          name: ing.ingredientName,
          quantity: ing.quantity,
          unit: ing.unit,
        })),
        steps: aiRecipeData.steps,
        referenceUrl: '',
        substitutions: aiRecipeData.substitutions || [],
      };

      setGeneratedRecipe(mappedRecipe);
    } catch (error: any) {
      // console.error('❌ AI 레시피 생성 실패:', error);
      setGenerateErrorMessage(
        error.message || 'AI 레시피 생성에 실패했습니다. 다시 시도해주세요.',
      );
      setGenerateErrorModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 레시피 저장
  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;
    setSaveConfirmVisible(true);
  };

  const handleSaveConfirm = async () => {
    if (!generatedRecipe) return;

    try {
      setIsLoading(true);
      setSaveConfirmVisible(false);

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

      // console.log('📤 AI 레시피 저장 요청:', saveData);
      const savedRecipe = await RecipeAPI.saveAIRecipe(saveData);
      // console.log('✅ AI 레시피 저장 성공:', savedRecipe);

      const currentFridgeId = await AsyncStorageService.getSelectedFridgeId();
      // console.log('📦 현재 냉장고 ID:', currentFridgeId);

      setSaveSuccessVisible(true);
    } catch (error: any) {
      // console.error('❌ AI 레시피 저장 실패:', error);
      setSaveErrorMessage(error.message || '레시피 저장에 실패했습니다.');
      setSaveErrorModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSuccess = () => {
    setSaveSuccessVisible(false);
    setGeneratedRecipe(null);
    setPrompt('');
    navigation.navigate('RecipeHome' as any);
  };

  const handleRegenerate = () => {
    setGeneratedRecipe(null);
    generateRecipe();
  };

  const handleNewRequest = () => {
    setPrompt('');
    setGeneratedRecipe(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerSection}>
          <Text style={styles.headerTitle}>AI 레시피 추천</Text>
        </View>
        {generatedRecipe ? (
          <TouchableOpacity
            style={[styles.newRequestButtonContainer, styles.rightSection]}
            onPress={handleNewRequest}
          >
            <Icon name="autorenew" size={24} color="#333" />
          </TouchableOpacity>
        ) : (
          <View style={styles.rightSection}>
            <></>
          </View>
        )}
      </View>

      {/* Body */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!generatedRecipe && !isLoading && (
          <>
            {/* Prompt Input Section */}
            <View style={styles.promptSection}>
              <Text style={styles.sectionTitle}>
                어떤 요리를 만들고 싶으신가요?
              </Text>
              <Text style={styles.sectionSubtitle}>
                재료, 요리 종류, 시간, 난이도 등을 자유롭게 입력해보세요
              </Text>
              <TextInput
                style={styles.promptInput}
                value={prompt}
                onChangeText={setPrompt}
                placeholder="예: 김치와 돼지고기로 간단한 요리 | 10분 안에 만들 수 있는 달걀 요리"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {prompt.trim() ? (
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={generateRecipe}
                  disabled={!prompt.trim()}
                >
                  <Icon name="auto-awesome" size={24} color="#f8f8f8" />
                  <Text style={styles.generateButtonText}>AI 레시피 생성</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.generateButtonDisabled}
                  onPress={generateRecipe}
                  disabled={!prompt.trim()}
                >
                  <Icon name="auto-awesome" size={24} color="#666" />
                  <Text style={styles.generateButtonTextDisabled}>
                    AI 레시피 생성
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Recent History */}
            {promptHistory.length > 0 && (
              <View style={styles.historySection}>
                <Text style={styles.sectionTitle}>최근 요청</Text>
                {promptHistory.map((item: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.historyItem}
                    onPress={() => setPrompt(item)}
                  >
                    <Icon name="history" size={20} color="#2F4858" />
                    <Text style={styles.historyText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Tip */}
            <View style={styles.tipSection}>
              <View style={styles.sectionTitleContainer}>
                <Icon
                  name="lightbulb"
                  size={20}
                  color="#2F4858"
                  style={styles.tipIcon}
                />
                <Text style={styles.tipSectionTitle}>사용 팁</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipText}>
                  • 구체적인 재료명을 포함해보세요
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipText}>
                  • 조리 시간이나 난이도를 명시해보세요
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipText}>
                  • 특별한 요구사항이 있다면 자세히 적어보세요
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Loading */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5F7F96" />
            <Text style={styles.loadingTitle}>
              AI가 레시피를 생성하고 있습니다
            </Text>
            <Text style={styles.loadingSubtitle}>잠시만 기다려주세요...</Text>
          </View>
        )}

        {/* Generated Recipe */}
        {generatedRecipe && (
          <View style={styles.recipeContainer}>
            {/* Recipe Summary */}
            <View style={styles.recipeHeader}>
              <Text style={styles.recipeTitle}>{generatedRecipe.title}</Text>
              <Text style={styles.recipeDescription}>
                {generatedRecipe.description}
              </Text>
            </View>

            {/* Ingredients */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>재료</Text>
              {generatedRecipe.ingredients.map(
                (ingredient: RecipeIngredient) => (
                  <View key={ingredient.id} style={styles.ingredientItem}>
                    <Icon
                      name="fiber-manual-record"
                      size={18}
                      color="#2F4858"
                    />
                    <Text style={styles.ingredientText}>
                      {ingredient.name} {ingredient.quantity}
                      {ingredient.unit}
                    </Text>
                  </View>
                ),
              )}
            </View>

            {/* Steps */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>조리 과정</Text>
              {generatedRecipe.steps.map((step: string, index: number) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepTextContainer}>
                    <Text style={styles.stepText}>
                      {step.replace(/^\d+\.\s*/, '').trim()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Substitutions */}
            {generatedRecipe.substitutions &&
              generatedRecipe.substitutions.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>재료 대체</Text>
                  {generatedRecipe.substitutions.map((sub, index) => (
                    <View key={index} style={styles.ingredientItem}>
                      <Icon name="swap-horiz" size={18} color="limegreen" />
                      <Text style={styles.ingredientText}>
                        {sub.original} → {sub.substitute}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

            {/* Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.regenerateButton]}
                onPress={handleRegenerate}
                disabled={isLoading}
              >
                <Icon name="autorenew" size={24} color="#666" />
                <Text style={styles.regenerateButtonText}>다시 생성</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSaveRecipe}
                disabled={isLoading}
              >
                <Icon name="save" size={20} color="#f8f8f8" />
                <Text style={styles.saveButtonText}>레시피 저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 프롬프트 입력 필요 알림 */}
      <ConfirmModal
        isAlert={false}
        visible={emptyPromptModalVisible}
        title="알림"
        message="요청 내용을 입력해주세요."
        iconContainer={{ backgroundColor: '#e8f5e9' }}
        icon={{ name: 'error-outline', color: 'rgba(47, 72, 88, 1)', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="general"
        onConfirm={() => setEmptyPromptModalVisible(false)}
        onCancel={() => setEmptyPromptModalVisible(false)}
      />

      {/* AI 레시피 생성 에러 */}
      <ConfirmModal
        isAlert={false}
        visible={generateErrorModalVisible}
        title="오류"
        message={generateErrorMessage}
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={() => setGenerateErrorModalVisible(false)}
        onCancel={() => setGenerateErrorModalVisible(false)}
      />

      {/* 레시피 저장 확인 */}
      <ConfirmModal
        isAlert={true}
        visible={saveConfirmVisible}
        title="레시피 저장"
        message="이 레시피를 내 레시피에 저장하시겠습니까?"
        iconContainer={{ backgroundColor: '#e8f5e9' }}
        icon={{ name: 'save', color: 'rgba(47, 72, 88, 1)', size: 48 }}
        confirmText="저장"
        cancelText="취소"
        confirmButtonStyle="general"
        onConfirm={handleSaveConfirm}
        onCancel={() => setSaveConfirmVisible(false)}
      />

      {/* 레시피 저장 성공 */}
      <ConfirmModal
        isAlert={false}
        visible={saveSuccessVisible}
        title="성공"
        message="레시피가 저장되었습니다.\n레시피 탭에서 확인하세요!"
        iconContainer={{ backgroundColor: '#d3f0d3' }}
        icon={{ name: 'check', color: 'limegreen', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={handleSaveSuccess}
        onCancel={handleSaveSuccess}
      />

      {/* 레시피 저장 실패 */}
      <ConfirmModal
        isAlert={false}
        visible={saveErrorModalVisible}
        title="오류"
        message={saveErrorMessage}
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={() => setSaveErrorModalVisible(false)}
        onCancel={() => setSaveErrorModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default AIRecipeScreen;
