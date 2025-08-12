import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Swipeable,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PaginationButton from '../../components/PaginationButton';
import { Recipe, RecipeStackParamList } from '../../RecipeNavigator';
import { styles } from './styles';

// 🔧 AsyncStorage 유틸리티 import
import {
  SharedRecipeStorage,
  FavoriteStorage,
} from '../../../../utils/AsyncStorageUtils';

type SharedFolderScreenNavigationProp = NativeStackNavigationProp<
  RecipeStackParamList,
  'SharedFolder'
>;

interface SharedFolderScreenProps {
  onBack?: () => void;
  onRecipePress?: (recipe: Recipe) => void;
}

const SharedFolderScreen: React.FC<SharedFolderScreenProps> = () => {
  const navigation = useNavigation<SharedFolderScreenNavigationProp>();
  const [sharedRecipes, setSharedRecipes] = useState<Recipe[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<any>(null);
  const ITEMS_PER_PAGE = 15;

  // 🔧 드래그앤드롭 핸들러 수정
  const handleDragEnd = React.useCallback(
    async ({ data }: { data: Recipe[] }) => {
      try {
        // 전체 레시피 목록에서 순서 업데이트
        const allRecipes = [...sharedRecipes];
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

        // 드래그된 데이터로 해당 부분만 교체
        data.forEach((recipe, index) => {
          const targetIndex = startIndex + index;
          if (targetIndex < allRecipes.length) {
            allRecipes[targetIndex] = recipe;
          }
        });

        // AsyncStorage에 새로운 순서 저장
        await SharedRecipeStorage.saveSharedRecipes(allRecipes);
        setSharedRecipes(allRecipes);
      } catch (error) {
        console.error('공유 레시피 순서 저장 실패:', error);
        Alert.alert('오류', '레시피 순서 변경에 실패했습니다.');
      }
    },
    [sharedRecipes, currentPage],
  );

  // 🔧 초기 데이터 로드
  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      // 공유 레시피만 로드 (즐겨찾기 데이터 제거)
      const storedSharedRecipes = await SharedRecipeStorage.getSharedRecipes();
      setSharedRecipes(storedSharedRecipes);
    } catch (error) {
      console.error('공유 레시피 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 🔧 화면 포커스 시 데이터 다시 로드
  useFocusEffect(
    React.useCallback(() => {
      loadInitialData();
    }, []),
  );

  // 🔧 공유 레시피 삭제 (AsyncStorage 연결)
  const deleteSharedRecipe = (recipeId: string) => {
    Alert.alert(
      '공동 레시피 삭제',
      '공동 폴더에서 이 레시피를 삭제하시겠습니까?\n다른 구성원들도 더 이상 볼 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // AsyncStorage에서 삭제
              await SharedRecipeStorage.deleteSharedRecipe(recipeId);

              // 로컬 상태 업데이트
              setSharedRecipes(prev => prev.filter(r => r.id !== recipeId));
            } catch (error) {
              console.error('공유 레시피 삭제 실패:', error);
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
    if (displayedRecipes.length === 0) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  };

  // 더보기
  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const displayedRecipes = sharedRecipes.slice(0, currentPage * ITEMS_PER_PAGE);
  const hasMoreRecipes = displayedRecipes.length < sharedRecipes.length;

  // 🔧 공동 레시피 카드 컴포넌트 (즐겨찾기 버튼 제거)
  const SharedRecipeCard: React.FC<{
    recipe: Recipe;
    drag?: () => void;
    isActive?: boolean;
  }> = ({ recipe, drag, isActive }) => {
    const renderRightActions = () => (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteSharedRecipe(recipe.id)}
      >
        <Icon name="delete" size={24} color="white" />
        <Text style={styles.deleteButtonText}>삭제</Text>
      </TouchableOpacity>
    );

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity
          style={[
            styles.sharedRecipeCard,
            isActive && { opacity: 0.8, transform: [{ scale: 1.02 }] },
          ]}
          onPress={() =>
            navigation.navigate('RecipeDetail', {
              recipe,
              fridgeId: 1,
              fridgeName: '우리집 냉장고',
            })
          }
          onLongPress={drag}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <Text style={styles.recipeDescription}>{recipe.description}</Text>
              <View style={styles.recipeMetaInfo}>
                <Text style={styles.recipeDate}>{recipe.createdAt}</Text>
                <View style={styles.sharedByContainer}>
                  <Icon name="person" size={14} color="#34C759" />
                  <Text style={styles.sharedByText}>
                    {recipe.sharedBy}님이 공유
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.cardActions}>
              {/* 🔧 즐겨찾기 버튼 제거 */}

              <View style={styles.cardIcon}>
                <Icon name="group" size={24} color="#34C759" />
              </View>

              {/* 드래그 핸들 */}
              <TouchableOpacity style={styles.dragHandle} onLongPress={drag}>
                <Icon name="drag-indicator" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View
          style={[
            styles.container,
            { justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <Text style={{ fontSize: 16, color: '#666' }}>
            공유 레시피를 불러오는 중...
          </Text>
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
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>공동 레시피 폴더</Text>
            <Text style={styles.headerSubtitle}>
              {sharedRecipes.length}개의 공유 레시피
            </Text>
          </View>

          <TouchableOpacity style={styles.headerAction}>
            <Icon name="more-vert" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* 공동 레시피 리스트 */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {/* 안내 메시지 */}
          <View style={styles.infoContainer}>
            <Icon name="info" size={20} color="#666" />
            <Text style={styles.infoText}>
              냉장고 구성원들이 함께 공유하는 레시피입니다.
            </Text>
          </View>

          {displayedRecipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="folder-open" size={48} color="#ccc" />
              <Text style={styles.emptyText}>공동 레시피가 없습니다</Text>
              <Text style={styles.emptySubText}>
                개인 레시피를 공동 폴더에 공유해보세요
              </Text>
            </View>
          ) : (
            <>
              {displayedRecipes.map((recipe: Recipe) => (
                <SharedRecipeCard key={recipe.id} recipe={recipe} />
              ))}

              {/* 더보기 버튼 */}
              {hasMoreRecipes && (
                <PaginationButton
                  type="loadMore"
                  onPress={loadMore}
                  text={`더보기 (${displayedRecipes.length}/${sharedRecipes.length})`}
                />
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
