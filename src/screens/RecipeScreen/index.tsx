import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Modal,
  Text,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomText from '../../components/common/CustomText';
// Card Components
import RecipeCard from './RecipeCard';
import FolderCard from './FolderCard';
// Modal Components
import CreateRecipeModal from '../../components/modals/CreateRecipeModal';
import AIRecipeModal from '../../components/modals/AIRecipeModal';
import { MainTabParamList, RootStackParamList } from '../../../App';
import { styles } from './styles';

type RecipeScreenRouteProp = RouteProp<MainTabParamList, 'Recipe'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface Recipe {
  id: string;
  title: string;
  ingredients: { name: string; amount: string }[];
  instructions: string[];
  cookingTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  servings?: number; // per
  cuisine?: string; // recipe style
  tags?: string[]; // tag
  rating?: number; // rating
  myNotes?: string; // note
  image?: string;
  link?: string;
  isAIGenerated: boolean;
  folderId: string;
  createdAt: Date;
}

export interface RecipeFolder {
  id: string;
  name: string;
  isShared: boolean;
  recipes: Recipe[];
  order: number;
}

interface RecipeOptions {
  difficulty: 'easy' | 'medium' | 'hard';
  cookingTime: 'quick' | 'medium' | 'long';
  servings: number;
  cuisine: string;
  dietaryRestrictions: string[];
}

const RecipeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RecipeScreenRouteProp>();

  const { fridgeId, fridgeName } = route.params;

  // States
  const [folders, setFolders] = useState<RecipeFolder[]>([]);
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>(
    [],
  );

  // data load
  useEffect(() => {
    loadRecipeData();
    loadAvailableIngredients();
  }, []);

  const loadRecipeData = async () => {
    try {
      // data load from AsyncStorage
      const storedFolders = await AsyncStorage.getItem(
        `recipes_folders_${fridgeId}`,
      );
      const storedRecipes = await AsyncStorage.getItem(`recipes_${fridgeId}`);

      if (storedFolders && storedRecipes) {
        setFolders(JSON.parse(storedFolders));
        setRecentRecipes(JSON.parse(storedRecipes));
      } else {
        // sample data
        const sampleFolders: RecipeFolder[] = [
          {
            id: 'shared',
            name: `${fridgeName} 공유 레시피`,
            isShared: true,
            recipes: [],
            order: 0,
          },
          {
            id: 'favorites',
            name: '즐겨찾기',
            isShared: false,
            recipes: [],
            order: 1,
          },
          {
            id: 'korean',
            name: '한식',
            isShared: false,
            recipes: [],
            order: 2,
          },
        ];

        const sampleRecipes: Recipe[] = [
          {
            id: '1',
            title: '토마토스튜',
            ingredients: [
              { name: '토마토파스타소스', amount: '3스푼' },
              { name: '양파', amount: '1개' },
              { name: '냉동닭가슴살', amount: '1개' },
              { name: '코인육수', amount: '1개' },
              { name: '당근', amount: '0.5개' },
              { name: '물', amount: '1컵' },
              { name: '올리브유', amount: '2스푼' },
              { name: '큐민', amount: '1스푼' },
            ],
            instructions: [
              '재료를 동일한 크기로 썬다',
              '약불에 닭가슴살을 올리브유에 노릇하게 볶는다',
              '양파를 넣고 카라멜라이징한다',
              '당근을 넣고 재료를 다같이 볶는다',
              '토마토파스타소스와 물, 코인육수를 넣고 끓인다',
              '당근이 원하는 식감으로 익으면 불을 끈다',
              '완성된 스튜에 큐민과 통후추를 기호대로 넣는다',
            ],
            cookingTime: 20,
            difficulty: 'easy',
            servings: 2,
            cuisine: '양식',
            isAIGenerated: false,
            folderId: 'korean',
            createdAt: new Date(),
          },
          {
            id: '2',
            title: '토마토 크림 파스타',
            ingredients: [
              { name: '파스타', amount: '200g' },
              { name: '토마토', amount: '3개' },
              { name: '크림', amount: '200ml' },
            ],
            instructions: [
              '파스타를 삶는다',
              '토마토 소스를 만든다',
              '크림을 넣어 완성한다',
            ],
            cookingTime: 30,
            difficulty: 'medium',
            servings: 2,
            cuisine: '양식',
            isAIGenerated: true,
            folderId: 'favorites',
            createdAt: new Date(),
          },
        ];

        setFolders(sampleFolders);
        setRecentRecipes(sampleRecipes);

        // AsyncStorage에 저장
        await AsyncStorage.setItem(
          `recipes_folders_${fridgeId}`,
          JSON.stringify(sampleFolders),
        );
        await AsyncStorage.setItem(
          `recipes_${fridgeId}`,
          JSON.stringify(sampleRecipes),
        );
      }
    } catch (error) {
      console.error('레시피 데이터 로드 실패:', error);
    }
  };

  // 냉장고 식재료 불러오기
  const loadAvailableIngredients = async () => {
    try {
      const fridgeData = await AsyncStorage.getItem(`fridge_${fridgeId}`);
      if (fridgeData) {
        const items = JSON.parse(fridgeData);
        const ingredients = items
          .filter((item: any) => item.expiryDate > new Date()) // 유통기한 지나지 않은 것만
          .map((item: any) => item.name);
        setAvailableIngredients(ingredients);
      }
    } catch (error) {
      console.log('식재료 로드 실패:', error);
    }
  };

  // AI 레시피 생성 (새로운 모달 방식)
  const handleAIGenerate = async (prompt: string, options: RecipeOptions) => {
    setIsAIGenerating(true);

    try {
      // TODO: 실제 OpenAI API 호출
      const aiRecipe = await callOpenAIAPI(prompt, options);

      // 생성된 레시피 객체 생성
      const newRecipe: Recipe = {
        id: Date.now().toString(),
        title: aiRecipe.title,
        ingredients: aiRecipe.ingredients,
        instructions: aiRecipe.instructions,
        cookingTime: getCookingTimeFromOption(options.cookingTime),
        difficulty: options.difficulty,
        servings: options.servings,
        cuisine: options.cuisine,
        tags: options.dietaryRestrictions,
        rating: 0,
        isAIGenerated: true,
        folderId: 'shared', // AI 레시피는 공유 폴더에 저장
        createdAt: new Date(),
      };

      // 상태 업데이트
      const updatedRecipes = [newRecipe, ...recentRecipes];
      setRecentRecipes(updatedRecipes);

      // AsyncStorage에 저장
      await AsyncStorage.setItem(
        `recipes_${fridgeId}`,
        JSON.stringify(updatedRecipes),
      );

      setShowAIModal(false);

      Alert.alert(
        '🎉 레시피 생성 완료!',
        `"${aiRecipe.title}"가 생성되었습니다!`,
        [
          {
            text: '레시피 보기',
            onPress: () => {
              navigation.navigate('RecipeDetailScreen', {
                recipe: newRecipe,
                fridgeId,
                fridgeName,
              });
            },
          },
          { text: '확인' },
        ],
      );
    } catch (error) {
      Alert.alert('오류', 'AI 레시피 생성에 실패했습니다. 다시 시도해주세요.');
      console.error('AI 레시피 생성 오류:', error);
    } finally {
      setIsAIGenerating(false);
    }
  };

  // 기존 간단한 AI 생성 (기존 버튼용)
  const generateAIRecipe = async () => {
    setIsAIGenerating(true);

    try {
      const ingredients = await getFridgeIngredients();
      const aiRecipe = await callOpenAIAPI(
        `냉장고에 있는 재료로 간단한 요리를 만들고 싶어요: ${ingredients.join(
          ', ',
        )}`,
        {
          difficulty: 'easy',
          cookingTime: 'quick',
          servings: 2,
          cuisine: '한식',
          dietaryRestrictions: [],
        },
      );

      const newRecipe: Recipe = {
        id: Date.now().toString(),
        title: aiRecipe.title,
        ingredients: aiRecipe.ingredients,
        instructions: aiRecipe.instructions,
        cookingTime: aiRecipe.cookingTime,
        difficulty: aiRecipe.difficulty,
        isAIGenerated: true,
        folderId: 'shared',
        createdAt: new Date(),
      };

      const updatedRecipes = [newRecipe, ...recentRecipes];
      setRecentRecipes(updatedRecipes);
      await AsyncStorage.setItem(
        `recipes_${fridgeId}`,
        JSON.stringify(updatedRecipes),
      );

      Alert.alert('완료', 'AI 레시피가 생성되었습니다!');
    } catch (error) {
      console.error('AI 레시피 생성 실패:', error);
      Alert.alert('오류', 'AI 레시피 생성에 실패했습니다.');
    } finally {
      setIsAIGenerating(false);
    }
  };

  // 유틸리티 함수들
  const getCookingTimeFromOption = (option: string): number => {
    switch (option) {
      case 'quick':
        return 30;
      case 'medium':
        return 45;
      case 'long':
        return 90;
      default:
        return 30;
    }
  };

  const getFridgeIngredients = async (): Promise<string[]> => {
    return availableIngredients;
  };

  const callOpenAIAPI = async (prompt: string, options: RecipeOptions) => {
    // 임시 시뮬레이션 (실제로는 OpenAI API 호출)
    await new Promise(resolve => setTimeout(resolve, 3000));

    return {
      title: `AI 추천 ${options.cuisine} 요리`,
      ingredients: [
        { name: '주재료', amount: '적당량' },
        { name: '부재료', amount: '1개' },
        { name: '조미료', amount: '약간' },
      ],
      instructions: [
        '재료를 준비합니다.',
        '적절히 조리합니다.',
        '맛있게 완성합니다!',
      ],
      cookingTime: getCookingTimeFromOption(options.cookingTime),
      difficulty: options.difficulty,
    };
  };

  // 새 폴더 추가
  const addNewFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert('알림', '폴더 이름을 입력해주세요.');
      return;
    }

    const newFolder: RecipeFolder = {
      id: Date.now().toString(),
      name: newFolderName,
      isShared: false,
      recipes: [],
      order: folders.length,
    };

    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);

    // AsyncStorage에 저장
    await AsyncStorage.setItem(
      `recipes_folders_${fridgeId}`,
      JSON.stringify(updatedFolders),
    );

    setNewFolderName('');
    setShowAddFolderModal(false);
  };

  // 폴더로 이동
  const navigateToFolder = (folder: RecipeFolder) => {
    navigation.navigate('RecipeFolderScreen', {
      folder,
      fridgeId,
      fridgeName,
    });
  };

  // 레시피 상세로 이동
  const navigateToRecipe = (recipe: Recipe) => {
    navigation.navigate('RecipeDetailScreen', {
      recipe,
      fridgeId,
      fridgeName,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <CustomText
          weight="bold"
          size={18}
          color="#333"
          style={styles.headerTitle}
        >
          레시피
        </CustomText>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowCreateModal(true)}
          >
            <MaterialIcons name="add" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowAddFolderModal(true)}
          >
            <MaterialIcons name="create-new-folder" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI 레시피 생성 섹션 */}
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <MaterialIcons name="auto-awesome" size={24} color="limegreen" />
            <Text style={styles.aiHeaderText}>우리 냉장고 맞춤 레시피</Text>
          </View>
          <Text style={styles.aiDescription}>
            현재 냉장고에 있는 식재료로 만들 수 있는 레시피를 AI가 추천해드려요
          </Text>

          {/* AI Buttons */}
          <View style={{ gap: 12 }}>
            {/* Recipe Generate Button : Simple Input */}
            <TouchableOpacity
              style={[
                styles.aiButtonPrimary,
                isAIGenerating && styles.aiButtonDisabled,
              ]}
              onPress={generateAIRecipe}
              disabled={isAIGenerating}
            >
              <MaterialIcons
                name={isAIGenerating ? 'hourglass-empty' : 'restaurant'}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.aiButtonText}>
                {isAIGenerating
                  ? 'AI 레시피 생성 중...'
                  : '빠른 AI 레시피 생성'}
              </Text>
            </TouchableOpacity>

            {/* Recipe Generate Button : Detail Input */}
            <TouchableOpacity
              style={[
                styles.aiDetailButton,
                isAIGenerating && styles.aiButtonDisabled,
              ]}
              onPress={() => setShowAIModal(true)}
              disabled={isAIGenerating}
            >
              <MaterialIcons name="tune" size={20} color="#4A90E2" />
              <CustomText
                weight="bold"
                size={16}
                color="#4A90E2"
                style={{ marginLeft: 8 }}
              >
                상세 조건으로 AI 레시피 생성
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Folder List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>레시피 폴더</Text>
          {folders.map(folder => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onPress={() => navigateToFolder(folder)}
            />
          ))}
        </View>

        {/* Recent Recipe */}
        {recentRecipes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>최근 레시피</Text>
            {recentRecipes.slice(0, 3).map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onPress={() => navigateToRecipe(recipe)}
              />
            ))}
          </View>
        )}

        {/* bottom spacing */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* MODALS ******************************************** */}
      {/* Create Recipe Modal */}
      <CreateRecipeModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        folders={folders}
        onSave={async recipe => {
          const updatedRecipes = [recipe, ...recentRecipes];
          setRecentRecipes(updatedRecipes);
          await AsyncStorage.setItem(
            `recipes_${fridgeId}`,
            JSON.stringify(updatedRecipes),
          );
          setShowCreateModal(false);
        }}
      />

      {/* Create AI Recipe Modal */}
      <AIRecipeModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGenerate={handleAIGenerate}
        availableIngredients={availableIngredients}
        isLoading={isAIGenerating}
      />

      {/* Add Folder Modal */}
      <Modal
        visible={showAddFolderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddFolderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 폴더 만들기</Text>

            <TextInput
              style={styles.modalInput}
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="폴더 이름"
              placeholderTextColor="#999"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowAddFolderModal(false);
                  setNewFolderName('');
                }}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={addNewFolder}
              >
                <Text style={styles.modalConfirmText}>생성</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RecipeScreen;
