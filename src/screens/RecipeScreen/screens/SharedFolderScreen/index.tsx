import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PaginationButton from '../../components/PaginationButton';
import { Recipe, RecipeStackParamList } from '../../RecipeNavigator';
import { styles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MockDataService, { FridgeInfo } from '../../../../utils/MockDataService';
import { SharedRecipeStorage } from '../../../../utils/AsyncStorageUtils';

type SharedFolderScreenNavigationProp = NativeStackNavigationProp<
  RecipeStackParamList,
  'SharedFolder'
>;

interface SharedFolderScreenProps {
  route: {
    params: {
      currentUserId?: number;
    };
  };
}

// 냉장고 폴더 카드 컴포넌트
const FridgeFolderCard: React.FC<{
  fridge: FridgeInfo;
  onPress: (fridge: FridgeInfo) => void;
}> = ({ fridge, onPress }) => (
  <TouchableOpacity
    style={styles.fridgeFolderCard}
    onPress={() => onPress(fridge)}
    activeOpacity={0.7}
  >
    <View style={styles.folderIcon}>
      <Icon name="kitchen" size={36} color="#444" />
    </View>
    <View style={styles.folderInfo}>
      <Text style={styles.folderName}>{fridge.name}</Text>
      <Text style={styles.folderSubInfo}>
        구성원 {fridge.memberCount}명 • 레시피 {fridge.recipes.length}개
      </Text>
    </View>
    <Icon name="chevron-right" size={32} color="#444" />
  </TouchableOpacity>
);

// 냉장고별 레시피 카드 컴포넌트
const FridgeRecipeCard: React.FC<{
  recipe: Recipe;
  onPress: (recipe: Recipe, fridgeId: number, fridgeName: string) => void;
  fridgeId: number;
  fridgeName: string;
}> = ({ recipe, onPress, fridgeId, fridgeName }) => (
  <TouchableOpacity
    style={styles.fridgeRecipeCard}
    onPress={() => onPress(recipe, fridgeId, fridgeName)}
    activeOpacity={0.7}
  >
    <Image
      source={require('../../../../assets/icons/chef_hat_96dp.png')}
      style={styles.recipeIcon}
      resizeMode="contain"
    />
    <View style={styles.recipeInfo}>
      <Text style={styles.recipeTitle}>{recipe.title}</Text>
      <Text style={styles.sharedByText}>{recipe.sharedBy}님의 레시피</Text>
    </View>
    <Icon name="group" size={20} color="#34C759" />
  </TouchableOpacity>
);

// 메인 컴포넌트
const SharedFolderScreen: React.FC<SharedFolderScreenProps> = ({ route }) => {
  const navigation = useNavigation<SharedFolderScreenNavigationProp>();
  const currentUserId = route.params?.currentUserId || 1;

  const [fridgeList, setFridgeList] = useState<FridgeInfo[]>([]);
  const [selectedFridge, setSelectedFridge] = useState<FridgeInfo | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // AsyncStorage에서 공유 레시피를 가져와서 냉장고별로 분류하는 함수
  const getSharedRecipesByFridge = async (): Promise<{
    [fridgeId: number]: Recipe[];
  }> => {
    try {
      // AsyncStorage에서 공유 레시피 가져오기
      const allSharedRecipes = await SharedRecipeStorage.getSharedRecipes();
      console.log('📱 AsyncStorage 공유 레시피:', allSharedRecipes);

      // 냉장고 ID별로 레시피 분류
      const recipesByFridge: { [fridgeId: number]: Recipe[] } = {};

      allSharedRecipes.forEach(recipe => {
        // 공유 레시피 ID에서 냉장고 ID 추출 (예: "shared-1-123-456" -> fridgeId = 1)
        const idParts = recipe.id.split('-');
        if (idParts.length >= 3 && idParts[0] === 'shared') {
          const fridgeId = parseInt(idParts[1]);
          if (!isNaN(fridgeId)) {
            if (!recipesByFridge[fridgeId]) {
              recipesByFridge[fridgeId] = [];
            }
            recipesByFridge[fridgeId].push(recipe);
          }
        }
      });

      console.log('🏠 냉장고별 분류된 레시피:', recipesByFridge);
      return recipesByFridge;
    } catch (error) {
      console.error('공유 레시피 조회 실패:', error);
      return {};
    }
  };

  // 사용자 냉장고 목록과 AsyncStorage 공유 레시피를 결합하는 함수
  const fetchUserFridgesWithSharedRecipes = async (
    userId: number,
  ): Promise<FridgeInfo[]> => {
    try {
      // 1. MockDataService에서 사용자 냉장고 기본 정보 가져오기
      const userFridges = await MockDataService.getUserFridges(userId);
      console.log('🏠 사용자 냉장고 목록:', userFridges);

      // 2. AsyncStorage에서 공유 레시피 가져오기
      const sharedRecipesByFridge = await getSharedRecipesByFridge();

      // 3. 각 냉장고에 실제 공유 레시피 할당
      const fridgesWithRealRecipes = userFridges.map(fridge => ({
        ...fridge,
        recipes: sharedRecipesByFridge[fridge.refrigeratorId] || [],
      }));

      console.log('✅ 최종 냉장고 + 공유 레시피:', fridgesWithRealRecipes);
      return fridgesWithRealRecipes;
    } catch (error) {
      console.error('사용자 냉장고 목록 조회 실패:', error);
      throw error;
    }
  };

  // 초기 데이터 로드
  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      console.log('🔄 데이터 로딩 시작...');

      // Mock 데이터 초기화 (MockDataService용)
      await MockDataService.initializeSharedRecipes();

      // AsyncStorage와 연동된 사용자 냉장고 목록 조회
      const userFridges = await fetchUserFridgesWithSharedRecipes(
        currentUserId,
      );
      setFridgeList(userFridges);

      console.log('✅ 데이터 로딩 완료');
    } catch (error) {
      console.error('❌ 데이터 로드 실패:', error);
      Alert.alert('오류', '냉장고 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, [currentUserId]);

  // 화면 포커스 시 데이터 다시 로드 (공유된 레시피 반영을 위해)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 화면 포커스 - 데이터 새로고침');
      loadInitialData();
      setSelectedFridge(null);
    }, [currentUserId]),
  );

  // 공유 레시피 삭제 (AsyncStorage에서)
  const deleteSharedRecipe = async (recipeId: string, fridgeId: number) => {
    Alert.alert(
      '공동 레시피 삭제',
      '이 레시피를 삭제하시겠습니까?\n냉장고의 모든 구성원이 더 이상 볼 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(`🗑️ 레시피 삭제 시작: ${recipeId}`);

              // AsyncStorage에서 공유 레시피 삭제
              await SharedRecipeStorage.deleteSharedRecipe(recipeId);

              // 로컬 상태 업데이트
              if (selectedFridge) {
                const updatedRecipes = selectedFridge.recipes.filter(
                  r => r.id !== recipeId,
                );
                setSelectedFridge({
                  ...selectedFridge,
                  recipes: updatedRecipes,
                });

                // 전체 냉장고 목록도 업데이트
                setFridgeList(prev =>
                  prev.map(fridge =>
                    fridge.refrigeratorId === fridgeId
                      ? { ...fridge, recipes: updatedRecipes }
                      : fridge,
                  ),
                );
              }

              console.log('✅ 레시피 삭제 완료');
              Alert.alert('성공', '레시피가 삭제되었습니다.');
            } catch (error) {
              console.error('❌ 공유 레시피 삭제 실패:', error);
              Alert.alert('오류', '레시피 삭제에 실패했습니다.');
            }
          },
        },
      ],
    );
  };

  // 스크롤 이벤트 처리
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowScrollToTop(scrollY > 300);
  };

  // 맨 위로 스크롤
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // 핸들러 함수들
  const handleFridgePress = (fridge: FridgeInfo) => {
    console.log(
      `🏠 냉장고 선택: ${fridge.name} (${fridge.recipes.length}개 레시피)`,
    );
    setSelectedFridge(fridge);
  };

  const handleRecipePress = (
    recipe: Recipe,
    fridgeId: number,
    fridgeName: string,
  ) => {
    console.log(`📖 레시피 선택: ${recipe.title}`);
    navigation.navigate('RecipeDetail', {
      recipe,
      fridgeId,
      fridgeName,
    });
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>냉장고를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GestureHandlerRootView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (selectedFridge) {
                setSelectedFridge(null);
              } else {
                navigation.goBack();
              }
            }}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {selectedFridge ? selectedFridge.name : '공동 레시피 폴더'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {selectedFridge
                ? `${selectedFridge.recipes.length}개의 공유 레시피`
                : `참여 중인 냉장고 ${fridgeList.length}개`}
            </Text>
          </View>
        </View>

        {/* 컨텐츠 */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {!selectedFridge ? (
            // 냉장고 목록 보기
            <>
              {/* 안내 메시지 */}
              <View style={styles.infoContainer}>
                <Icon
                  style={styles.infoIcon}
                  name="info"
                  size={20}
                  color="#888"
                />
                <Text style={styles.infoText}>
                  참여 중인 냉장고별 공유 레시피를 확인해 보세요!
                </Text>
              </View>

              {fridgeList.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="kitchen" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>
                    참여 중인 냉장고가 없습니다
                  </Text>
                  <Text style={styles.emptySubText}>
                    냉장고에 참여하여 레시피를 공유해보세요
                  </Text>
                </View>
              ) : (
                fridgeList.map(fridge => (
                  <FridgeFolderCard
                    key={fridge.refrigeratorId}
                    fridge={fridge}
                    onPress={handleFridgePress}
                  />
                ))
              )}
            </>
          ) : (
            // 선택된 냉장고의 레시피 목록 보기
            <>
              {/* 냉장고 정보 */}
              <View style={styles.infoContainer}>
                <Icon
                  style={styles.infoIcon}
                  name="info"
                  size={20}
                  color="#888"
                />
                <Text style={styles.infoText}>
                  구성원 {selectedFridge.memberCount}명이 함께 사용하는
                  냉장고입니다
                </Text>
              </View>

              {selectedFridge.recipes.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="restaurant" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>공유된 레시피가 없습니다</Text>
                  <Text style={styles.emptySubText}>
                    첫 번째 레시피를 공유해보세요
                  </Text>
                </View>
              ) : (
                selectedFridge.recipes.map(recipe => (
                  <FridgeRecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onPress={handleRecipePress}
                    fridgeId={selectedFridge.refrigeratorId}
                    fridgeName={selectedFridge.name}
                  />
                ))
              )}
            </>
          )}
        </ScrollView>

        {/* 맨 위로 버튼 */}
        <PaginationButton
          type="scrollToTop"
          onPress={scrollToTop}
          visible={showScrollToTop}
          style={styles.scrollToTopButton}
        />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default SharedFolderScreen;
