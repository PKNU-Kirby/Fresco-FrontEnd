import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RecipeStackParamList } from '../../RecipeNavigator';
import { styles } from './styles';

type AIRecipeScreenNavigationProp = NativeStackNavigationProp<
  RecipeStackParamList,
  'AIRecipe'
>;

interface RecipeIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface AIGeneratedRecipe {
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  referenceUrl?: string;
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

  // AI 레시피 생성 (Mock)
  const generateRecipe = async () => {
    if (!prompt.trim()) {
      Alert.alert('알림', '요청 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    // 프롬프트 히스토리 업데이트
    const newHistory = [
      prompt,
      ...promptHistory.filter(h => h !== prompt),
    ].slice(0, 6);
    setPromptHistory(newHistory);

    // Mock API 호출 시뮬레이션
    setTimeout(() => {
      // Mock 생성된 레시피
      const mockRecipe: AIGeneratedRecipe = {
        title: '김치 돼지고기 볶음',
        description:
          'AI가 추천하는 김치와 돼지고기를 활용한 간단하고 맛있는 요리입니다.',
        ingredients: [
          { id: '1', name: '김치', quantity: '200', unit: 'g' },
          { id: '2', name: '돼지고기 목살', quantity: '150', unit: 'g' },
          { id: '3', name: '양파', quantity: '1/2', unit: '개' },
          { id: '4', name: '대파', quantity: '1', unit: '대' },
          { id: '5', name: '마늘', quantity: '3', unit: '쪽' },
          { id: '6', name: '참기름', quantity: '1', unit: '큰술' },
        ],
        steps: [
          '돼지고기는 먹기 좋은 크기로 썰어 준비합니다.',
          '김치는 물기를 짜고 적당한 크기로 썰어줍니다.',
          '양파와 대파, 마늘을 썰어 준비합니다.',
          '팬에 기름을 두르고 돼지고기를 볶아줍니다.',
          '돼지고기가 반 정도 익으면 마늘을 넣고 볶습니다.',
          '김치를 넣고 함께 볶아 김치의 신맛을 날려줍니다.',
          '양파를 넣고 볶다가 대파를 넣어 마무리합니다.',
          '참기름을 넣고 한 번 더 볶아 완성합니다.',
        ],
        referenceUrl: '',
      };

      setGeneratedRecipe(mockRecipe);
      setIsLoading(false);
    }, 2000);
  };

  // 레시피 저장 - AI 생성 데이터 -> RecipeDetail
  const handleSaveRecipe = () => {
    if (generatedRecipe) {
      Alert.alert('레시피 저장', '이 레시피를 내 레시피에 저장하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        {
          text: '저장',
          onPress: () => {
            // 🔧 AI 생성 데이터를 aiGeneratedData로 전달
            navigation.navigate('RecipeDetail', {
              isNewRecipe: true,
              isEditing: true,
              fridgeId: 1, // TODO: 실제 fridgeId 전달
              fridgeName: '우리집 냉장고', // TODO: 실제 fridgeName 전달
              aiGeneratedData: {
                title: generatedRecipe.title,
                description: generatedRecipe.description,
                ingredients: generatedRecipe.ingredients,
                steps: generatedRecipe.steps,
                referenceUrl: generatedRecipe.referenceUrl || '',
              },
            });
          },
        },
      ]);
    }
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
    <SafeAreaView style={styles.safeArea}>
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
                    <Icon name="history" size={20} color="#666" />
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
                  color="limegreen"
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
            <ActivityIndicator size="large" color="limegreen" />
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
                      color="limegreen"
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
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.regenerateButton]}
                onPress={handleRegenerate}
              >
                <Icon name="autorenew" size={24} color="#666" />
                <Text style={styles.regenerateButtonText}>다시 생성</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSaveRecipe}
              >
                <Icon name="save" size={20} color="#f8f8f8" />
                <Text style={styles.saveButtonText}>레시피 저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AIRecipeScreen;
