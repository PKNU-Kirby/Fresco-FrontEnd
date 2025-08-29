import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PaginationButton from '../../../components/Recipe/PaginationButton';
import { Recipe, RecipeStackParamList } from '../RecipeNavigator';
import { SharedRecipeStorage } from '../../../utils/AsyncStorageUtils';
import {
  AsyncStorageService,
  FridgeWithRole,
} from '../../../services/AsyncStorageService';
import { User } from '../../../types/auth';
import { styles } from './styles';

type SharedFolderScreenNavigationProp = NativeStackNavigationProp<
  RecipeStackParamList,
  'SharedFolder'
>;

interface UserFridge {
  fridge: {
    id: number;
    name: string;
    description?: string;
    ownerId: number;
    inviteCode: string;
    memberCount: number;
  };
  role: 'owner' | 'member';
  joinedAt: string;
  recipes: Recipe[];
}

interface SharedFolderScreenProps {
  route: {
    params: {
      currentUserId?: number;
    };
  };
}

// 냉장고 폴더 카드 컴포넌트
const FridgeFolderCard: React.FC<{
  userFridge: UserFridge;
  onPress: (userFridge: UserFridge) => void;
  onLongPress: (userFridge: UserFridge) => void;
}> = ({ userFridge, onPress, onLongPress }) => (
  <TouchableOpacity
    style={styles.fridgeFolderCard}
    onPress={() => onPress(userFridge)}
    onLongPress={() => onLongPress(userFridge)}
    activeOpacity={0.7}
  >
    <View style={styles.folderIcon}>
      <Icon name="kitchen" size={36} color="#444" />
      {userFridge.role === 'owner' && (
        <View style={styles.ownerBadge}>
          <Icon name="star" size={12} color="#FFD700" />
        </View>
      )}
    </View>
    <View style={styles.folderInfo}>
      <Text style={styles.folderName}>{userFridge.fridge.name}</Text>
      <Text style={styles.folderSubInfo}>
        구성원 {userFridge.fridge.memberCount}명 • 레시피{' '}
        {userFridge.recipes.length}개
        {userFridge.role === 'owner' ? ' • 소유자' : ' • 멤버'}
      </Text>
      <Text style={styles.folderDebug}>ID: {userFridge.fridge.id}</Text>
    </View>
    <Icon name="chevron-right" size={32} color="#444" />
  </TouchableOpacity>
);

// 메인 컴포넌트
const SharedFolderScreen: React.FC<SharedFolderScreenProps> = ({ route }) => {
  const navigation = useNavigation<SharedFolderScreenNavigationProp>();
  const currentUserId = route.params?.currentUserId || 1;

  const [fridgeList, setFridgeList] = useState<UserFridge[]>([]);
  const [selectedFridge, setSelectedFridge] = useState<UserFridge | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // 공유 레시피를 냉장고별로 분류
  const getSharedRecipesByFridge = async (): Promise<{
    [fridgeId: string]: Recipe[];
  }> => {
    try {
      const allSharedRecipes = await SharedRecipeStorage.getSharedRecipes();
      const recipesByFridge: { [fridgeId: string]: Recipe[] } = {};

      allSharedRecipes.forEach(recipe => {
        const idParts = recipe.id.split('-');
        if (idParts.length >= 3 && idParts[0] === 'shared') {
          const fridgeId = idParts[1]; // string 타입으로 유지
          if (!recipesByFridge[fridgeId]) {
            recipesByFridge[fridgeId] = [];
          }
          recipesByFridge[fridgeId].push(recipe);
        }
      });

      return recipesByFridge;
    } catch (error) {
      console.error('공유 레시피 조회 실패:', error);
      return {};
    }
  };

  // 사용자 냉장고 목록과 공유 레시피 결합 (FridgeSelectScreen 시스템 사용)
  const loadUserFridgesWithRecipes = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('=== 냉장고 데이터 로드 시작 ===');

      // 현재 사용자 ID 조회 (FridgeSelectScreen 방식)
      const currentUserId = await AsyncStorageService.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('현재 사용자 ID를 찾을 수 없습니다.');
      }

      // 사용자 정보 조회
      const user = await AsyncStorageService.getUserById(currentUserId);
      setCurrentUser(user);
      console.log('현재 사용자:', user);

      if (!user) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      // 사용자가 참여한 냉장고 목록 조회 (FridgeSelectScreen 시스템 사용)
      const userFridges = await AsyncStorageService.getUserRefrigerators(
        parseInt(user.id, 10),
      );
      console.log('사용자 냉장고 목록:', userFridges);

      // 공유 레시피를 냉장고별로 분류
      const sharedRecipesByFridge = await getSharedRecipesByFridge();
      console.log('냉장고별 공유 레시피:', sharedRecipesByFridge);

      // 냉장고 정보와 레시피 결합
      const fridgesWithRecipes: UserFridge[] = userFridges.map(fridge => ({
        fridge: {
          id: parseInt(fridge.id, 10), // number로 변환
          name: fridge.name,
          description: '', // FridgeWithRole에는 description이 없음
          ownerId: fridge.isOwner ? parseInt(user.id, 10) : 0, // 임시값
          inviteCode: fridge.inviteCode || '', // 초대 코드 추가
          memberCount: fridge.memberCount,
        },
        role: fridge.role,
        joinedAt: fridge.createdAt,
        recipes: sharedRecipesByFridge[fridge.id] || [],
      }));

      setFridgeList(fridgesWithRecipes);
      console.log('=== 최종 냉장고 + 레시피 ===:', fridgesWithRecipes);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      Alert.alert(
        '오류',
        '냉장고 정보를 불러오는데 실패했습니다.\n\n' + error.message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadUserFridgesWithRecipes();
  }, [currentUserId]);

  // 화면 포커스 시 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      loadUserFridgesWithRecipes();
      setSelectedFridge(null);
    }, [currentUserId]),
  );

  const handleFridgePress = (userFridge: UserFridge) => {
    setSelectedFridge(userFridge);
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowScrollToTop(scrollY > 300);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
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
              {selectedFridge ? selectedFridge.fridge.name : '공동 레시피'}
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
                <View style={styles.infoIcon}>
                  <Icon name="info" size={20} color="#888" />
                </View>
                <Text style={styles.infoText}>
                  참여 중인 냉장고별 공유 레시피를 확인해 보세요!
                  {'\n'}길게 눌러서 냉장고 설정을 변경할 수 있습니다.
                </Text>
              </View>

              {fridgeList.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="kitchen" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>
                    참여 중인 냉장고가 없습니다
                  </Text>
                  <Text style={styles.emptySubText}>
                    새 냉장고를 만들거나 초대 코드로 참여해보세요
                  </Text>
                </View>
              ) : (
                fridgeList.map(userFridge => (
                  <FridgeFolderCard
                    key={userFridge.fridge.id}
                    userFridge={userFridge}
                    onPress={handleFridgePress}
                    onLongPress={() => {}} // 길게 누르기 기능 일시 제거
                  />
                ))
              )}
            </>
          ) : (
            // 선택된 냉장고의 레시피 목록 보기
            <View style={styles.emptyContainer}>
              <Icon name="restaurant" size={48} color="#ccc" />
              <Text style={styles.emptyText}>공유된 레시피가 없습니다</Text>
              <Text style={styles.emptySubText}>
                첫 번째 레시피를 공유해보세요
              </Text>
            </View>
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
