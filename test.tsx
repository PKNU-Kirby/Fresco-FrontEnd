// SharedFolderScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ConfirmModal from '../../../components/modals/ConfirmModal';

import { User } from '../../../types/auth';
import RecipeAPI from '../../../services/API/RecipeAPI';
import { ApiService } from '../../../services/apiServices';
import {
  Recipe,
  RecipeIngredient,
  RecipeDetailResponse,
} from '../../../types/Recipe';
import {
  calculateMultipleRecipeAvailability,
  RecipeAvailabilityInfo,
} from '../../../utils/recipeAvailabilityUtils';
import { RecipeStackParamList } from '../RecipeNavigator';
import { AsyncStorageService } from '../../../services/AsyncStorageService';
import { IngredientControllerAPI } from '../../../services/API/ingredientControllerAPI';
import { styles, sharedRecipeStyles } from './styles';

// ... 기존 타입 정의들 ...

// 메인 컴포넌트
const SharedFolderScreen: React.FC<SharedFolderScreenProps> = ({ route }) => {
  const navigation = useNavigation<SharedFolderScreenNavigationProp>();

  const currentFridgeId = route.params?.currentFridgeId;
  const currentUserId = route.params?.currentUserId || 1;

  const [fridgeList, setFridgeList] = useState<UserFridge[]>([]);
  const [selectedFridge, setSelectedFridge] = useState<UserFridge | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [_currentUser, setCurrentUser] = useState<User | null>(null);

  const [recipeAvailabilities, setRecipeAvailabilities] = useState
    Map<string, RecipeAvailabilityInfo>
  >(new Map());

  const [recipeDetails, setRecipeDetails] = useState
    Map<string, RecipeDetailResponse>
  >(new Map());

  // ConfirmModal 상태들
  const [loadErrorModalVisible, setLoadErrorModalVisible] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteSuccessVisible, setDeleteSuccessVisible] = useState(false);
  const [deleteErrorVisible, setDeleteErrorVisible] = useState(false);
  const [noPermissionVisible, setNoPermissionVisible] = useState(false); // 👈 추가
  const [selectedRecipeForDelete, setSelectedRecipeForDelete] =
    useState<Recipe | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  // ... 기존 함수들 (loadFridgeIngredients, loadUserFridgesWithRecipes, calculateRecipeAvailabilities) ...

  // 레시피 카드 클릭 핸들러
  const handleRecipePress = (recipe: Recipe) => {
    if (!selectedFridge) return;

    navigation.navigate('RecipeDetail', {
      recipe,
      fridgeId: selectedFridge.fridge.id,
      fridgeName: selectedFridge.fridge.name,
      currentFridgeId: currentFridgeId,
      fridgeIngredients: selectedFridge.ingredients,
      fromSharedFolder: true,
      isSharedRecipe: true,
      userRole: selectedFridge.role, // 👈 추가: 사용자 권한 전달
    });
  };

  // 레시피 삭제 핸들러 - 권한 체크 추가
  const handleRecipeDelete = async (recipe: Recipe) => {
    if (!selectedFridge) return;

    // 👇 권한 체크 로직 추가
    if (selectedFridge.role !== 'owner') {
      setNoPermissionVisible(true);
      return;
    }

    setSelectedRecipeForDelete(recipe);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecipeForDelete) return;

    try {
      setDeleteConfirmVisible(false);
      await RecipeAPI.deleteRecipe(selectedRecipeForDelete.id);
      await loadUserFridgesWithRecipes();
      setDeleteSuccessVisible(true);
      setSelectedRecipeForDelete(null);
    } catch (error) {
      console.error('레시피 삭제 실패:', error);
      setDeleteConfirmVisible(false);
      setDeleteErrorVisible(true);
      setSelectedRecipeForDelete(null);
    }
  };

  // ... 기존 useEffect, useFocusEffect 등 ...

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GestureHandlerRootView style={styles.container}>
        {/* ... 기존 header, ScrollView 등 ... */}

        {/* 데이터 로드 에러 모달 */}
        <ConfirmModal
          isAlert={false}
          visible={loadErrorModalVisible}
          title="오류"
          message={loadErrorMessage}
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setLoadErrorModalVisible(false)}
          onCancel={() => setLoadErrorModalVisible(false)}
        />

        {/* 👇 권한 없음 모달 추가 */}
        <ConfirmModal
          isAlert={false}
          visible={noPermissionVisible}
          title="권한 없음"
          message="공유 레시피는 방장만 삭제할 수 있습니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'block', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setNoPermissionVisible(false)}
          onCancel={() => setNoPermissionVisible(false)}
        />

        {/* 레시피 삭제 확인 모달 */}
        <ConfirmModal
          isAlert={true}
          visible={deleteConfirmVisible}
          title="레시피 삭제"
          message={`"${selectedRecipeForDelete?.title}" 레시피를 삭제하시겠습니까?`}
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="삭제"
          cancelText="취소"
          confirmButtonStyle="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteConfirmVisible(false);
            setSelectedRecipeForDelete(null);
          }}
        />

        {/* 레시피 삭제 성공 모달 */}
        <ConfirmModal
          isAlert={false}
          visible={deleteSuccessVisible}
          title="성공"
          message="레시피가 삭제되었습니다."
          iconContainer={{ backgroundColor: '#d3f0d3' }}
          icon={{ name: 'check', color: 'limegreen', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setDeleteSuccessVisible(false)}
          onCancel={() => setDeleteSuccessVisible(false)}
        />

        {/* 레시피 삭제 실패 모달 */}
        <ConfirmModal
          isAlert={false}
          visible={deleteErrorVisible}
          title="오류"
          message="레시피 삭제에 실패했습니다."
          iconContainer={{ backgroundColor: '#fae1dd' }}
          icon={{ name: 'error-outline', color: 'tomato', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="primary"
          onConfirm={() => setDeleteErrorVisible(false)}
          onCancel={() => setDeleteErrorVisible(false)}
        />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default SharedFolderScreen;