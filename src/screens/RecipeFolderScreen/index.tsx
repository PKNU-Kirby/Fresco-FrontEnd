import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import CustomText from '../../components/common/CustomText';
import RecipeCard from '../RecipeScreen/RecipeCard';
import { RootStackParamList } from '../../../App';
import { Recipe } from '../RecipeScreen';
import { styles } from './styles';

type RecipeFolderScreenRouteProp = RouteProp<
  RootStackParamList,
  'RecipeFolderScreen'
>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RecipeFolderScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RecipeFolderScreenRouteProp>();

  const { folder, fridgeId, fridgeName } = route.params;
  const [recipes, setRecipes] = useState<Recipe[]>(folder.recipes);
  const [isEditMode, setIsEditMode] = useState(false);

  // 레시피 순서 변경 (드래그앤드롭)
  const handleReorder = ({ data }: { data: Recipe[] }) => {
    setRecipes(data);
    // TODO: 서버에 순서 변경 저장
  };

  // 레시피 삭제
  const handleDeleteRecipe = (recipeId: string) => {
    Alert.alert('레시피 삭제', '이 레시피를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
        },
      },
    ]);
  };

  // 레시피 상세로 이동
  const navigateToRecipe = (recipe: Recipe) => {
    navigation.navigate('RecipeDetailScreen', {
      recipe,
      fridgeId,
      fridgeName,
    });
  };

  // 새 레시피 추가
  const addNewRecipe = () => {
    navigation.navigate('RecipeEditScreen', {
      folderId: folder.id,
      fridgeId,
      fridgeName,
    });
  };

  // 드래그 가능한 레시피 아이템 렌더링
  const renderDraggableItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<Recipe>) => {
    return (
      <View style={[styles.recipeItem, isActive && styles.recipeItemActive]}>
        <View style={styles.recipeContent}>
          <RecipeCard recipe={item} onPress={() => navigateToRecipe(item)} />
        </View>

        {isEditMode && (
          <View style={styles.editControls}>
            <TouchableOpacity
              style={styles.dragHandle}
              onLongPress={drag}
              disabled={isActive}
            >
              <MaterialIcons name="drag-handle" size={24} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteRecipe(item.id)}
            >
              <MaterialIcons name="delete" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 커스텀 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <CustomText weight="bold" size={18} color="#333">
            {folder.name}
          </CustomText>
          {folder.isShared && (
            <View style={styles.sharedBadge}>
              <MaterialIcons name="people" size={12} color="#FFF" />
              <CustomText
                size={10}
                color="#FFF"
                weight="medium"
                style={{ marginLeft: 2 }}
              >
                공유
              </CustomText>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsEditMode(!isEditMode)}
          >
            <CustomText size={14} color="#007AFF" weight="medium">
              {isEditMode ? '완료' : '편집'}
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton} onPress={addNewRecipe}>
            <MaterialIcons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 폴더 정보 */}
      <View style={styles.folderInfo}>
        <CustomText size={14} color="#666">
          총 {recipes.length}개의 레시피
        </CustomText>
        {folder.isShared && (
          <CustomText size={12} color="#999" style={{ marginTop: 2 }}>
            {fridgeName} 구성원들과 공유 중
          </CustomText>
        )}
      </View>

      {/* 레시피 목록 */}
      {recipes.length > 0 ? (
        <DraggableFlatList
          data={recipes}
          renderItem={renderDraggableItem}
          keyExtractor={item => item.id}
          onDragEnd={handleReorder}
          containerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="restaurant-menu" size={64} color="#DDD" />
          <CustomText
            weight="medium"
            size={16}
            color="#999"
            style={{ marginTop: 16 }}
          >
            아직 레시피가 없어요
          </CustomText>
          <CustomText
            size={14}
            color="#999"
            style={{ marginTop: 4, textAlign: 'center' }}
          >
            새로운 레시피를 추가해보세요
          </CustomText>

          <TouchableOpacity
            style={styles.addFirstRecipeButton}
            onPress={addNewRecipe}
          >
            <MaterialIcons name="add" size={20} color="#FFF" />
            <CustomText
              weight="bold"
              size={14}
              color="#FFF"
              style={{ marginLeft: 4 }}
            >
              첫 번째 레시피 추가
            </CustomText>
          </TouchableOpacity>
        </View>
      )}

      {/* 편집 모드 안내 */}
      {isEditMode && recipes.length > 0 && (
        <View style={styles.editHint}>
          <MaterialIcons name="info" size={16} color="#007AFF" />
          <CustomText size={12} color="#007AFF" style={{ marginLeft: 4 }}>
            드래그 핸들을 길게 눌러 순서 변경, 휴지통으로 삭제
          </CustomText>
        </View>
      )}
    </SafeAreaView>
  );
};

export default RecipeFolderScreen;
