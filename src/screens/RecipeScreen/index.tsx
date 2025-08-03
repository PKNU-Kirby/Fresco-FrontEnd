import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../components/common/CustomText';
import RecipeCard from './RecipeCard';
import FolderCard from './FolderCard';
import CreateRecipeModal from '../../components/modals/CreateRecipeModal';
import { MainTabParamList, RootStackParamList } from '../../../App';
import { styles } from './styles';

type RecipeScreenRouteProp = RouteProp<MainTabParamList, 'Recipe'>;
// RootStackParamList를 사용하여 모든 스크린에 접근 가능하도록 변경
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
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

const RecipeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RecipeScreenRouteProp>();

  const { fridgeId, fridgeName } = route.params;

  // 상태 관리
  const [folders, setFolders] = useState<RecipeFolder[]>([]);
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    loadRecipeData();
  }, []);

  const loadRecipeData = async () => {
    try {
      // TODO: AsyncStorage 또는 API에서 데이터 로드
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
          title: '궁국의 볶음밥',
          ingredients: ['밥', '계란', '파', '간장'],
          instructions: ['밥을 볶는다', '계란을 넣는다'],
          cookingTime: 15,
          difficulty: 'easy',
          isAIGenerated: true,
          folderId: 'korean',
          createdAt: new Date(),
        },
        {
          id: '2',
          title: '토마토 크림 파스타',
          ingredients: ['파스타', '토마토', '크림'],
          instructions: ['파스타를 삶는다', '소스를 만든다'],
          cookingTime: 30,
          difficulty: 'medium',
          isAIGenerated: true,
          folderId: 'favorites',
          createdAt: new Date(),
        },
      ];

      setFolders(sampleFolders);
      setRecentRecipes(sampleRecipes);
    } catch (error) {
      console.error('레시피 데이터 로드 실패:', error);
    }
  };

  // AI 레시피 생성
  const generateAIRecipe = async () => {
    setIsAIGenerating(true);

    try {
      // TODO: 냉장고 식재료 가져오기
      const ingredients = await getFridgeIngredients();

      // TODO: OpenAI API 호출
      const aiRecipe = await callOpenAIAPI(ingredients);

      // 생성된 레시피를 공유 폴더에 추가
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

      setRecentRecipes(prev => [newRecipe, ...prev]);

      Alert.alert('완료', 'AI 레시피가 생성되었습니다!');
    } catch (error) {
      console.error('AI 레시피 생성 실패:', error);
      Alert.alert('오류', 'AI 레시피 생성에 실패했습니다.');
    } finally {
      setIsAIGenerating(false);
    }
  };

  // 임시 함수들 (실제 구현 필요)
  const getFridgeIngredients = async () => {
    return ['양파', '당근', '감자', '돼지고기'];
  };

  const callOpenAIAPI = async (ingredients: string[]) => {
    // 임시 응답
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      title: 'AI 추천 볶음밥',
      ingredients: ingredients,
      instructions: ['재료를 준비한다', '볶는다', '완성한다'],
      cookingTime: 20,
      difficulty: 'easy' as const,
    };
  };

  // 새 폴더 추가
  const addNewFolder = () => {
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

    setFolders(prev => [...prev, newFolder]);
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
      {/* 헤더 */}
      <View style={styles.header}>
        <CustomText weight="bold" size={18} color="#333">
          레시피
        </CustomText>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowCreateModal(true)}
          >
            <MaterialIcons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowAddFolderModal(true)}
          >
            <MaterialIcons name="create-new-folder" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI 레시피 생성 섹션 */}
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <MaterialIcons name="auto-awesome" size={24} color="#FF6B35" />
            <CustomText
              weight="bold"
              size={18}
              color="#333"
              style={{ marginLeft: 8 }}
            >
              우리 냉장고 맞춤 레시피
            </CustomText>
          </View>
          <CustomText
            size={14}
            color="#666"
            style={{ lineHeight: 20, marginBottom: 16 }}
          >
            현재 냉장고에 있는 식재료로 만들 수 있는 레시피를 AI가 추천해드려요
          </CustomText>
          <TouchableOpacity
            style={[styles.aiButton, isAIGenerating && styles.aiButtonDisabled]}
            onPress={generateAIRecipe}
            disabled={isAIGenerating}
          >
            <MaterialIcons
              name={isAIGenerating ? 'hourglass-empty' : 'restaurant'}
              size={20}
              color="#FFFFFF"
            />
            <CustomText
              weight="bold"
              size={16}
              color="#FFFFFF"
              style={{ marginLeft: 8 }}
            >
              {isAIGenerating ? 'AI 레시피 생성 중...' : 'AI 레시피 생성하기'}
            </CustomText>
          </TouchableOpacity>
        </View>

        {/* 폴더 목록 */}
        <View style={styles.section}>
          <CustomText
            weight="bold"
            size={20}
            color="#333"
            style={{ marginBottom: 16 }}
          >
            레시피 폴더
          </CustomText>
          {folders.map(folder => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onPress={() => navigateToFolder(folder)}
            />
          ))}
        </View>

        {/* 최근 레시피 */}
        {recentRecipes.length > 0 && (
          <View style={styles.section}>
            <CustomText
              weight="bold"
              size={20}
              color="#333"
              style={{ marginBottom: 16 }}
            >
              최근 레시피
            </CustomText>
            {recentRecipes.slice(0, 3).map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onPress={() => navigateToRecipe(recipe)}
              />
            ))}
          </View>
        )}

        {/* 하단 여백 */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* 레시피 생성 모달 */}
      <CreateRecipeModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        folders={folders}
        onSave={recipe => {
          setRecentRecipes(prev => [recipe, ...prev]);
          setShowCreateModal(false);
        }}
      />

      {/* 폴더 추가 모달 */}
      <Modal
        visible={showAddFolderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddFolderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomText
              weight="bold"
              size={18}
              color="#333"
              style={{ textAlign: 'center', marginBottom: 20 }}
            >
              새 폴더 만들기
            </CustomText>

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
                <CustomText weight="medium" size={16} color="#666">
                  취소
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={addNewFolder}
              >
                <CustomText weight="bold" size={16} color="#FFFFFF">
                  생성
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RecipeScreen;
