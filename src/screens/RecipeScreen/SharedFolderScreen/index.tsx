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

// 디버그 모달 컴포넌트
const DebugModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const [debugData, setDebugData] = useState<string>('');

  const loadDebugData = async () => {
    try {
      const keys = [
        'refrigerators',
        'refrigeratorUsers',
        'userId',
        'users',
        'shared_recipes',
      ];

      const data: any = {};
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        data[key] = value ? JSON.parse(value) : null;
      }

      setDebugData(JSON.stringify(data, null, 2));
    } catch (error) {
      setDebugData('디버그 데이터 로드 실패: ' + error.message);
    }
  };

  useEffect(() => {
    if (visible) {
      loadDebugData();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={debugModalStyles.overlay}>
        <View style={debugModalStyles.container}>
          <View style={debugModalStyles.header}>
            <Text style={debugModalStyles.title}>AsyncStorage 디버그</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={debugModalStyles.content}>
            <Text style={debugModalStyles.data}>{debugData}</Text>
          </ScrollView>
          <TouchableOpacity
            style={debugModalStyles.button}
            onPress={async () => {
              await AsyncStorage.multiRemove([
                'refrigerators',
                'refrigeratorUsers',
              ]);
              Alert.alert('완료', '냉장고 데이터가 초기화되었습니다.');
              onClose();
            }}
          >
            <Text style={debugModalStyles.buttonText}>
              냉장고 데이터 초기화
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// 냉장고 생성 모달
const CreateFridgeModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onConfirm: (name: string, description: string) => void;
}> = ({ visible, onClose, onConfirm }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleConfirm = () => {
    if (name.trim().length === 0) {
      Alert.alert('알림', '냉장고 이름을 입력해주세요.');
      return;
    }
    onConfirm(name.trim(), description.trim());
    setName('');
    setDescription('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <Text style={modalStyles.title}>새 냉장고 만들기</Text>
          <TextInput
            style={modalStyles.input}
            placeholder="냉장고 이름 (필수)"
            value={name}
            onChangeText={setName}
            maxLength={20}
          />
          <TextInput
            style={[modalStyles.input, modalStyles.textArea]}
            placeholder="설명 (선택사항)"
            value={description}
            onChangeText={setDescription}
            maxLength={100}
            multiline
            numberOfLines={3}
          />
          <View style={modalStyles.buttons}>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.cancelButton]}
              onPress={onClose}
            >
              <Text style={modalStyles.cancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={modalStyles.confirmText}>만들기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 냉장고 참여 모달
const JoinFridgeModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onConfirm: (inviteCode: string) => void;
}> = ({ visible, onClose, onConfirm }) => {
  const [inviteCode, setInviteCode] = useState('');

  const handleConfirm = () => {
    if (inviteCode.trim().length !== 6) {
      Alert.alert('알림', '6자리 초대 코드를 입력해주세요.');
      return;
    }
    onConfirm(inviteCode.trim().toUpperCase());
    setInviteCode('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <Text style={modalStyles.title}>냉장고 참여하기</Text>
          <Text style={modalStyles.subtitle}>
            6자리 초대 코드를 입력해주세요
          </Text>
          <TextInput
            style={[modalStyles.input, modalStyles.codeInput]}
            placeholder="초대 코드 (예: ABC123)"
            value={inviteCode}
            onChangeText={text => setInviteCode(text.toUpperCase())}
            maxLength={6}
            autoCapitalize="characters"
          />
          <View style={modalStyles.buttons}>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.cancelButton]}
              onPress={onClose}
            >
              <Text style={modalStyles.cancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={modalStyles.confirmText}>참여하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
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
          inviteCode: '', // FridgeWithRole에는 inviteCode가 없음
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

  // 냉장고 생성 (FridgeSelectScreen 시스템 사용)
  const handleCreateFridge = async (name: string, description: string) => {
    try {
      setShowCreateModal(false);
      setIsLoading(true);
      console.log('냉장고 생성 요청:', { name, description });

      // 현재 사용자 확인
      if (!currentUser) {
        throw new Error('현재 사용자 정보가 없습니다.');
      }

      // FridgeSelectScreen 시스템으로 냉장고 생성
      const result = await AsyncStorageService.createRefrigerator(
        name,
        parseInt(currentUser.id, 10),
      );

      console.log('생성된 냉장고:', result);

      Alert.alert('냉장고 생성 완료!', `'${name}' 냉장고가 생성되었습니다.`, [
        { text: '확인' },
      ]);

      // 데이터 새로고침
      await loadUserFridgesWithRecipes();
    } catch (error) {
      console.error('냉장고 생성 실패:', error);
      Alert.alert('오류', '냉장고 생성에 실패했습니다.\n\n' + error.message);
      setIsLoading(false);
    }
  };

  // 냉장고 참여 (FridgeSelectScreen 시스템에는 초대 코드 기능이 없으므로 비활성화)
  const handleJoinFridge = async (inviteCode: string) => {
    Alert.alert(
      '기능 제한',
      '현재 시스템에서는 초대 코드를 통한 냉장고 참여 기능이 지원되지 않습니다.',
      [{ text: '확인' }],
    );
    setShowJoinModal(false);
    setIsLoading(false);
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
              {selectedFridge ? selectedFridge.fridge.name : '공동 레시피 폴더'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {selectedFridge
                ? `${selectedFridge.recipes.length}개의 공유 레시피`
                : `참여 중인 냉장고 ${fridgeList.length}개`}
            </Text>
          </View>

          {/* 헤더 액션 버튼들 */}
          {!selectedFridge && (
            <View style={styles.headerActions}>
              {__DEV__ && (
                <TouchableOpacity
                  style={[styles.headerAction, { backgroundColor: '#FF9800' }]}
                  onPress={() => setShowDebugModal(true)}
                >
                  <Icon name="bug-report" size={16} color="white" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.headerAction}
                onPress={() => setShowJoinModal(true)}
              >
                <Icon name="login" size={20} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerAction}
                onPress={() => setShowCreateModal(true)}
              >
                <Icon name="add" size={20} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          )}
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
                  <View style={styles.emptyActions}>
                    <TouchableOpacity
                      style={[styles.emptyAction, styles.createAction]}
                      onPress={() => setShowCreateModal(true)}
                    >
                      <Icon name="add" size={16} color="white" />
                      <Text style={styles.emptyActionText}>냉장고 만들기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.emptyAction, styles.joinAction]}
                      onPress={() => setShowJoinModal(true)}
                    >
                      <Icon name="login" size={16} color="#4CAF50" />
                      <Text
                        style={[styles.emptyActionText, { color: '#4CAF50' }]}
                      >
                        냉장고 참여하기
                      </Text>
                    </TouchableOpacity>
                  </View>
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

        {/* 모달들 */}
        <CreateFridgeModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleCreateFridge}
        />

        <JoinFridgeModal
          visible={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onConfirm={handleJoinFridge}
        />

        <DebugModal
          visible={showDebugModal}
          onClose={() => setShowDebugModal(false)}
        />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

// 모달 스타일
const modalStyles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  } as const,
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  } as const,
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  } as const,
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  } as const,
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  } as const,
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  } as const,
  codeInput: {
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 4,
    fontFamily: 'monospace',
  } as const,
  buttons: {
    flexDirection: 'row',
    gap: 12,
  } as const,
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  } as const,
  cancelButton: {
    backgroundColor: '#f0f0f0',
  } as const,
  confirmButton: {
    backgroundColor: '#4CAF50',
  } as const,
  cancelText: {
    color: '#666',
    fontWeight: '500',
  } as const,
  confirmText: {
    color: 'white',
    fontWeight: '600',
  } as const,
};

// 디버그 모달 스타일
const debugModalStyles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  } as const,
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  } as const,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  } as const,
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  } as const,
  content: {
    flex: 1,
    padding: 20,
  } as const,
  data: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#333',
    lineHeight: 14,
  } as const,
  button: {
    margin: 20,
    padding: 12,
    backgroundColor: '#FF5722',
    borderRadius: 8,
    alignItems: 'center',
  } as const,
  buttonText: {
    color: 'white',
    fontWeight: '600',
  } as const,
};

export default SharedFolderScreen;
