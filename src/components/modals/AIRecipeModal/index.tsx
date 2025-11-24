import React, { useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import ConfirmModal from '../ConfirmModal'; // ConfirmModal import 추가
import { styles } from './styles';

interface AIRecipeModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, options: RecipeOptions) => void;
  availableIngredients?: string[]; // 냉장고에 있는 식재료
  isLoading?: boolean;
}

interface RecipeOptions {
  difficulty: 'easy' | 'medium' | 'hard';
  cookingTime: 'quick' | 'medium' | 'long'; // 30분 이하, 30-60분, 60분 이상
  servings: number;
  cuisine: string; // 한식, 중식, 일식, 양식, 기타
  dietaryRestrictions: string[]; // 채식, 비건, 글루텐프리 등
}

const AIRecipeModal: React.FC<AIRecipeModalProps> = ({
  visible,
  onClose,
  onGenerate,
  availableIngredients = [],
  isLoading = false,
}) => {
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState<RecipeOptions>({
    difficulty: 'medium',
    cookingTime: 'medium',
    servings: 2,
    cuisine: '한식',
    dietaryRestrictions: [],
  });

  // 알림 모달 상태 추가
  const [showAlertModal, setShowAlertModal] = useState(false);

  // 빠른 프롬프트 템플릿
  const quickPrompts = [
    '간단한 한끼 요리 추천해주세요',
    '냉장고 재료로 만들 수 있는 요리',
    '다이어트용 저칼로리 요리',
    '아이들이 좋아할 만한 요리',
    '손님 접대용 요리',
    '술안주로 좋은 요리',
  ];

  const difficulties = [
    { key: 'easy', label: '쉬움', desc: '초보자도 OK' },
    { key: 'medium', label: '보통', desc: '기본 요리 실력' },
    { key: 'hard', label: '어려움', desc: '요리 고수용' },
  ];

  const cookingTimes = [
    { key: 'quick', label: '빠름', desc: '30분 이내' },
    { key: 'medium', label: '보통', desc: '30-60분' },
    { key: 'long', label: '오래', desc: '60분 이상' },
  ];

  const cuisines = ['한식', '중식', '일식', '양식', '동남아', '기타'];

  const dietaryOptions = ['채식', '비건', '글루텐프리', '저염식', '저당식'];

  const handleGenerate = () => {
    if (!prompt.trim()) {
      setShowAlertModal(true);
      return;
    }

    // 프롬프트에 옵션 정보 추가
    const enhancedPrompt = `
${prompt}

[요청 조건]
- 난이도: ${difficulties.find(d => d.key === options.difficulty)?.label}
- 조리시간: ${cookingTimes.find(t => t.key === options.cookingTime)?.desc}
- 인분: ${options.servings}인분
- 요리 스타일: ${options.cuisine}
${
  options.dietaryRestrictions.length > 0
    ? `- 식단 제한: ${options.dietaryRestrictions.join(', ')}`
    : ''
}
${
  availableIngredients.length > 0
    ? `\n[보유 식재료]\n${availableIngredients.join(', ')}`
    : ''
}

위 조건을 고려해서 구체적인 레시피를 만들어주세요.
`;

    onGenerate(enhancedPrompt, options);
  };

  const toggleDietaryRestriction = (restriction: string) => {
    setOptions(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction],
    }));
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="fade"
        presentationStyle="overFullScreen"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text size={16} color="#666">
                취소
              </Text>
            </TouchableOpacity>
            <Text weight="bold" size={18}>
              AI 레시피 생성
            </Text>
            <TouchableOpacity
              onPress={handleGenerate}
              style={[
                styles.generateButton,
                isLoading && styles.disabledButton,
              ]}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text weight="bold" size={16} color="#fff">
                  생성
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* 프롬프트 입력 */}
            <View style={styles.section}>
              <Text weight="bold" size={16} style={styles.sectionTitle}>
                🤖 AI에게 요청하기
              </Text>
              <TextInput
                style={styles.promptInput}
                placeholder="예: 매콤한 닭볶음탕을 만들고 싶어요"
                placeholderTextColor="#999"
                value={prompt}
                onChangeText={setPrompt}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <Text size={12} color="#666" style={styles.charCount}>
                {prompt.length}/500
              </Text>
            </View>

            {/* 빠른 프롬프트 */}
            <View style={styles.section}>
              <Text weight="bold" size={14} style={styles.sectionTitle}>
                💡 빠른 선택
              </Text>
              <View style={styles.quickPromptsContainer}>
                {quickPrompts.map((quickPrompt, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickPromptButton}
                    onPress={() => setPrompt(quickPrompt)}
                  >
                    <Text size={12} color="#4A90E2">
                      {quickPrompt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 난이도 선택 */}
            <View style={styles.section}>
              <Text weight="bold" size={14} style={styles.sectionTitle}>
                🎯 난이도
              </Text>
              <View style={styles.optionRow}>
                {difficulties.map(diff => (
                  <TouchableOpacity
                    key={diff.key}
                    style={[
                      styles.optionButton,
                      options.difficulty === diff.key && styles.selectedOption,
                    ]}
                    onPress={() =>
                      setOptions(prev => ({
                        ...prev,
                        difficulty: diff.key as any,
                      }))
                    }
                  >
                    <Text
                      size={12}
                      color={options.difficulty === diff.key ? '#fff' : '#666'}
                      weight={
                        options.difficulty === diff.key ? 'bold' : 'regular'
                      }
                    >
                      {diff.label}
                    </Text>
                    <Text
                      size={10}
                      color={options.difficulty === diff.key ? '#fff' : '#999'}
                    >
                      {diff.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 조리시간 선택 */}
            <View style={styles.section}>
              <Text weight="bold" size={14} style={styles.sectionTitle}>
                ⏰ 조리시간
              </Text>
              <View style={styles.optionRow}>
                {cookingTimes.map(time => (
                  <TouchableOpacity
                    key={time.key}
                    style={[
                      styles.optionButton,
                      options.cookingTime === time.key && styles.selectedOption,
                    ]}
                    onPress={() =>
                      setOptions(prev => ({
                        ...prev,
                        cookingTime: time.key as any,
                      }))
                    }
                  >
                    <Text
                      size={12}
                      color={options.cookingTime === time.key ? '#fff' : '#666'}
                      weight={
                        options.cookingTime === time.key ? 'bold' : 'regular'
                      }
                    >
                      {time.label}
                    </Text>
                    <Text
                      size={10}
                      color={options.cookingTime === time.key ? '#fff' : '#999'}
                    >
                      {time.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 인분 선택 */}
            <View style={styles.section}>
              <Text weight="bold" size={14} style={styles.sectionTitle}>
                👥 인분
              </Text>
              <View style={styles.servingsContainer}>
                <TouchableOpacity
                  style={styles.servingsButton}
                  onPress={() =>
                    setOptions(prev => ({
                      ...prev,
                      servings: Math.max(1, prev.servings - 1),
                    }))
                  }
                >
                  <Text size={18} color="#4A90E2">
                    -
                  </Text>
                </TouchableOpacity>
                <Text size={16} weight="bold" style={styles.servingsText}>
                  {options.servings}인분
                </Text>
                <TouchableOpacity
                  style={styles.servingsButton}
                  onPress={() =>
                    setOptions(prev => ({
                      ...prev,
                      servings: Math.min(10, prev.servings + 1),
                    }))
                  }
                >
                  <Text size={18} color="#4A90E2">
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 요리 스타일 */}
            <View style={styles.section}>
              <Text weight="bold" size={14} style={styles.sectionTitle}>
                🍜 요리 스타일
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.cuisineRow}>
                  {cuisines.map(cuisine => (
                    <TouchableOpacity
                      key={cuisine}
                      style={[
                        styles.cuisineButton,
                        options.cuisine === cuisine && styles.selectedCuisine,
                      ]}
                      onPress={() => setOptions(prev => ({ ...prev, cuisine }))}
                    >
                      <Text
                        size={12}
                        color={options.cuisine === cuisine ? '#fff' : '#666'}
                        weight={
                          options.cuisine === cuisine ? 'bold' : 'regular'
                        }
                      >
                        {cuisine}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* 식단 제한 */}
            <View style={styles.section}>
              <Text weight="bold" size={14} style={styles.sectionTitle}>
                🥗 식단 제한 (선택사항)
              </Text>
              <View style={styles.dietaryContainer}>
                {dietaryOptions.map(dietary => (
                  <TouchableOpacity
                    key={dietary}
                    style={[
                      styles.dietaryButton,
                      options.dietaryRestrictions.includes(dietary) &&
                        styles.selectedDietary,
                    ]}
                    onPress={() => toggleDietaryRestriction(dietary)}
                  >
                    <Text
                      size={12}
                      color={
                        options.dietaryRestrictions.includes(dietary)
                          ? '#fff'
                          : '#666'
                      }
                    >
                      {dietary}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 보유 식재료 정보 */}
            {availableIngredients.length > 0 && (
              <View style={styles.section}>
                <Text weight="bold" size={14} style={styles.sectionTitle}>
                  🥕 냉장고 보유 식재료
                </Text>
                <View style={styles.ingredientsContainer}>
                  {availableIngredients
                    .slice(0, 10)
                    .map((ingredient, index) => (
                      <View key={index} style={styles.ingredientTag}>
                        <Text size={11} color="#4A90E2">
                          {ingredient}
                        </Text>
                      </View>
                    ))}
                  {availableIngredients.length > 10 && (
                    <Text size={11} color="#999">
                      +{availableIngredients.length - 10}개 더
                    </Text>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      <ConfirmModal
        isAlert={false}
        visible={showAlertModal}
        title="알림"
        message="어떤 요리를 원하는지 입력해주세요!"
        iconContainer={{ backgroundColor: '#fae1dd' }}
        icon={{
          name: 'error-outline',
          color: 'tomato',
          size: 48,
        }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => setShowAlertModal(false)}
        onCancel={() => setShowAlertModal(false)}
      />
    </>
  );
};

export default AIRecipeModal;
