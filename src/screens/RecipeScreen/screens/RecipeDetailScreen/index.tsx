import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {
  Recipe,
  RecipeStackParamList,
  RecipeIngredient,
} from '../../RecipeNavigator';
import {
  RecipeStorage,
  FavoriteStorage,
  SharedRecipeStorage,
} from '../../../../utils/AsyncStorageUtils';
import { styles } from './styles';

type RecipeDetailScreenNavigationProp = NativeStackNavigationProp<
  RecipeStackParamList,
  'RecipeDetail'
>;
type RecipeDetailScreenRouteProp = RouteProp<
  RecipeStackParamList,
  'RecipeDetail'
>;

interface RecipeDetailScreenProps {}

const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = () => {
  const navigation = useNavigation<RecipeDetailScreenNavigationProp>();
  const route = useRoute<RecipeDetailScreenRouteProp>();

  const {
    recipe,
    isEditing = false,
    isNewRecipe = false,
    // fridgeId,
    // fridgeName,
    aiGeneratedData,
  } = route.params;

  // AI 데이터/기존 레시피 데이터로 초기화
  const getInitialRecipe = (): Recipe => {
    if (aiGeneratedData) {
      // AI 생성 데이터가 있으면
      return {
        id: '',
        title: aiGeneratedData.title || '',
        description: aiGeneratedData.description || '',
        createdAt: new Date().toISOString().split('T')[0],
        ingredients: aiGeneratedData.ingredients || [],
        steps: aiGeneratedData.steps || [],
        referenceUrl: aiGeneratedData.referenceUrl || '',
      };
    } else if (recipe) {
      // 기존 레시피 있으면
      return recipe;
    } else {
      // 새 레시피 생성
      return {
        id: '',
        title: '',
        description: '',
        createdAt: new Date().toISOString().split('T')[0],
        ingredients: [],
        steps: [],
        referenceUrl: '',
      };
    }
  };

  // 상태 관리
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>(
    getInitialRecipe(),
  );
  const [isEditMode, setIsEditMode] = useState(
    isEditing || isNewRecipe || !!aiGeneratedData,
  );
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 공유된 레시피인지 확인하는 helper 함수
  const isSharedRecipe = currentRecipe.isShared || false;

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      if (currentRecipe.id && !isSharedRecipe) {
        // 공유된 레시피가 아닌 경우에만 즐겨찾기 상태 로드
        try {
          const favoriteIds = await FavoriteStorage.getFavoriteIds();
          setIsFavorite(favoriteIds.includes(currentRecipe.id));
        } catch (error) {
          console.error('즐겨찾기 상태 로드 실패:', error);
        }
      }
    };

    loadInitialData();
  }, [currentRecipe.id, isSharedRecipe]);

  // 레시피 저장 (개인/공유 레시피 구분)
  const handleSave = async () => {
    if (!currentRecipe.title.trim()) {
      Alert.alert('오류', '레시피 제목을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      if (isNewRecipe) {
        // 새 레시피 생성
        const newRecipe: Recipe = {
          ...currentRecipe,
          id: Date.now().toString(), // 임시 ID
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };

        await RecipeStorage.addPersonalRecipe(newRecipe);
        setCurrentRecipe(newRecipe);

        Alert.alert('성공', '레시피가 저장되었습니다.', [
          {
            text: '확인',
            onPress: () => navigation.navigate('RecipeHome' as never),
          },
        ]);
      } else {
        // 기존 레시피 업데이트
        const updatedRecipe: Recipe = {
          ...currentRecipe,
          updatedAt: new Date().toISOString().split('T')[0],
        };

        // 공유 레시피인지 확인 -> 적절한 저장소에 저장
        if (currentRecipe.isShared) {
          // 공유 레시피 업데이트
          await SharedRecipeStorage.updateSharedRecipe(updatedRecipe);
        } else {
          // 개인 레시피 업데이트
          await RecipeStorage.updatePersonalRecipe(updatedRecipe);
        }

        setCurrentRecipe(updatedRecipe);
        Alert.alert('성공', '레시피가 업데이트되었습니다.');
      }

      setIsEditMode(false);
    } catch (error) {
      console.error('레시피 저장 실패:', error);
      Alert.alert('오류', '레시피 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 즐겨찾기 토글 (공유 레시피가 아닌 경우에만)
  const toggleFavorite = async () => {
    if (!currentRecipe.id || isSharedRecipe) return;

    try {
      const newFavoriteState = await FavoriteStorage.toggleFavorite(
        currentRecipe.id,
      );
      setIsFavorite(newFavoriteState);
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
      Alert.alert('오류', '즐겨찾기 설정에 실패했습니다.');
    }
  };

  // 구성원과 공유 (개인 레시피인 경우에만)
  const shareWithMembers = async () => {
    if (!currentRecipe.id || isSharedRecipe) {
      Alert.alert('오류', '저장된 개인 레시피만 공유할 수 있습니다.');
      return;
    }

    Alert.alert('구성원과 공유', '이 레시피를 공동 폴더에 공유하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '공유',
        onPress: async () => {
          try {
            // 공유 레시피로 변환
            const sharedRecipe: Recipe = {
              ...currentRecipe,
              id: `shared-${currentRecipe.id}`, // 공유 레시피용 ID
              isShared: true,
              sharedBy: '나', // TODO: 실제 사용자 이름으로 변경
            };

            // 기존 공유 레시피 목록 가져오기
            const currentSharedRecipes =
              await SharedRecipeStorage.getSharedRecipes();

            // 이미 공유된 레시피인지 확인
            const alreadyShared = currentSharedRecipes.some(
              sr => sr.title === currentRecipe.title,
            );

            if (alreadyShared) {
              Alert.alert('알림', '이미 공유된 레시피입니다.');
              return;
            }

            // 공유 레시피 목록에 추가
            const updatedSharedRecipes = [
              sharedRecipe,
              ...currentSharedRecipes,
            ];
            await SharedRecipeStorage.saveSharedRecipes(updatedSharedRecipes);

            Alert.alert('성공', '레시피가 공동 폴더에 공유되었습니다.');
          } catch (error) {
            console.error('레시피 공유 실패:', error);
            Alert.alert('오류', '레시피 공유에 실패했습니다.');
          }
        },
      },
    ]);
  };

  // 재료 추가
  const addIngredient = () => {
    const newIngredient: RecipeIngredient = {
      id: Date.now().toString(),
      name: '',
      quantity: '',
      unit: '',
    };
    setCurrentRecipe(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), newIngredient],
    }));
  };

  // 재료 삭제
  const removeIngredient = (id: string) => {
    setCurrentRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients?.filter(ing => ing.id !== id) || [],
    }));
  };

  // 재료 업데이트
  const updateIngredient = (
    id: string,
    field: keyof RecipeIngredient,
    value: string,
  ) => {
    setCurrentRecipe(prev => ({
      ...prev,
      ingredients:
        prev.ingredients?.map(ing =>
          ing.id === id ? { ...ing, [field]: value } : ing,
        ) || [],
    }));
  };

  // 조리법 단계 추가
  const addStep = () => {
    setCurrentRecipe(prev => ({
      ...prev,
      steps: [...(prev.steps || []), ''],
    }));
  };

  // 조리법 단계 삭제
  const removeStep = (index: number) => {
    setCurrentRecipe(prev => ({
      ...prev,
      steps: prev.steps?.filter((_, i) => i !== index) || [],
    }));
  };

  // 조리법 단계 업데이트
  const updateStep = (index: number, value: string) => {
    setCurrentRecipe(prev => ({
      ...prev,
      steps: prev.steps?.map((step, i) => (i === index ? value : step)) || [],
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {isNewRecipe
              ? '새 레시피'
              : isEditMode
              ? '레시피 편집'
              : '레시피 상세'}
          </Text>

          <View style={styles.headerActions}>
            {/* Favorite Button */}
            {currentRecipe.id && !isSharedRecipe && (
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={toggleFavorite}
              >
                <Icon
                  name={isFavorite ? 'favorite' : 'favorite-border'}
                  size={24}
                  color={isFavorite ? '#ffd000' : '#999'}
                />
              </TouchableOpacity>
            )}

            {/* edit / save button */}
            {isEditMode ? (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={isLoading}
              >
                <FontAwesome6 name="circle-check" size={24} color="#333" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditMode(true)}
              >
                <Icon name="edit" size={24} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 공유 레시피 -> 안내 메시지 표시 */}
          {isSharedRecipe && (
            <View style={styles.sharedIndicator}>
              <Icon name="group" size={20} color="#34C759" />
              <Text style={styles.sharedText}>
                {currentRecipe.sharedBy}님이 공유한 레시피입니다
              </Text>
            </View>
          )}

          {/* Recipe Title */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>레시피 제목</Text>
            {isEditMode ? (
              <TextInput
                style={styles.titleInput}
                value={currentRecipe.title}
                onChangeText={text =>
                  setCurrentRecipe(prev => ({ ...prev, title: text }))
                }
                placeholder="레시피 제목을 입력하세요"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.title}>{currentRecipe.title}</Text>
            )}
          </View>

          {/* Recipe Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>소개</Text>
            {isEditMode ? (
              <TextInput
                style={styles.descriptionInput}
                value={currentRecipe.description}
                onChangeText={text =>
                  setCurrentRecipe(prev => ({ ...prev, description: text }))
                }
                placeholder="레시피 설명을 입력하세요"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.description}>
                {currentRecipe.description}
              </Text>
            )}
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>재료</Text>
              {isEditMode && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addIngredient}
                >
                  <Icon name="add" size={20} color="#007AFF" />
                  <Text style={styles.addButtonText}>재료 추가</Text>
                </TouchableOpacity>
              )}
            </View>

            {currentRecipe.ingredients?.map((ingredient, index) => (
              <View key={ingredient.id} style={styles.ingredientItem}>
                {isEditMode ? (
                  <View style={styles.ingredientEditRow}>
                    <TextInput
                      style={[styles.ingredientInput, styles.ingredientName]}
                      value={ingredient.name}
                      onChangeText={text =>
                        updateIngredient(ingredient.id, 'name', text)
                      }
                      placeholder="재료명"
                      placeholderTextColor="#999"
                    />
                    <TextInput
                      style={[
                        styles.ingredientInput,
                        styles.ingredientQuantity,
                      ]}
                      value={ingredient.quantity}
                      onChangeText={text =>
                        updateIngredient(ingredient.id, 'quantity', text)
                      }
                      placeholder="양"
                      placeholderTextColor="#999"
                    />
                    <TextInput
                      style={[styles.ingredientInput, styles.ingredientUnit]}
                      value={ingredient.unit}
                      onChangeText={text =>
                        updateIngredient(ingredient.id, 'unit', text)
                      }
                      placeholder="단위"
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeIngredient(ingredient.id)}
                    >
                      <Icon name="remove" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.ingredientText}>
                    • {ingredient.name} {ingredient.quantity}
                    {ingredient.unit}
                  </Text>
                )}
              </View>
            ))}
          </View>

          {/* 조리법 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>조리법</Text>
              {isEditMode && (
                <TouchableOpacity style={styles.addButton} onPress={addStep}>
                  <Icon name="add" size={20} color="#007AFF" />
                  <Text style={styles.addButtonText}>단계 추가</Text>
                </TouchableOpacity>
              )}
            </View>

            {currentRecipe.steps?.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                {isEditMode ? (
                  <View style={styles.stepEditRow}>
                    <Text style={styles.stepNumber}>{index + 1}.</Text>
                    <TextInput
                      style={styles.stepInput}
                      value={step}
                      onChangeText={text => updateStep(index, text)}
                      placeholder={`${index + 1}번째 조리 과정을 입력하세요`}
                      placeholderTextColor="#999"
                      multiline
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeStep(index)}
                    >
                      <Icon name="remove" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.stepRow}>
                    <Text style={styles.stepNumber}>{index + 1}.</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* 참고 URL */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>참고 URL</Text>
            {isEditMode ? (
              <TextInput
                style={styles.urlInput}
                value={currentRecipe.referenceUrl}
                onChangeText={text =>
                  setCurrentRecipe(prev => ({ ...prev, referenceUrl: text }))
                }
                placeholder="참고 URL을 입력하세요"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.url}>
                {currentRecipe.referenceUrl || '없음'}
              </Text>
            )}
          </View>

          {/* 🔧 구성원과 공유 버튼 - 개인 레시피인 경우에만 표시 */}
          {!isEditMode && currentRecipe.id && !isSharedRecipe && (
            <TouchableOpacity
              style={styles.shareButton}
              onPress={shareWithMembers}
            >
              <Icon name="group" size={24} color="white" />
              <Text style={styles.shareButtonText}>구성원과 공유</Text>
            </TouchableOpacity>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RecipeDetailScreen;
