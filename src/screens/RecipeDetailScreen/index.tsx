import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  SafeAreaView,
  Share,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../components/common/CustomText';
import { RootStackParamList } from '../../../App';
import { styles } from './styles';

type RecipeDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'RecipeDetailScreen'
>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RecipeDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RecipeDetailScreenRouteProp>();

  const { recipe, fridgeId, fridgeName } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);

  // 난이도 정보
  const getDifficultyInfo = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return {
          text: '쉬움',
          color: '#4CAF50',
          icon: 'sentiment-very-satisfied',
        };
      case 'medium':
        return { text: '보통', color: '#FF9800', icon: 'sentiment-satisfied' };
      case 'hard':
        return {
          text: '어려움',
          color: '#F44336',
          icon: 'sentiment-dissatisfied',
        };
      default:
        return { text: '보통', color: '#999', icon: 'sentiment-neutral' };
    }
  };

  const difficultyInfo = getDifficultyInfo(recipe.difficulty);

  // 즐겨찾기 토글
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: 실제 즐겨찾기 상태 저장
  };

  // 레시피 공유
  const handleShare = async () => {
    try {
      const shareContent = `
🍳 ${recipe.title}

📝 재료:
${recipe.ingredients.map((ing, index) => `${index + 1}. ${ing}`).join('\n')}

👨‍🍳 조리 방법:
${recipe.instructions.map((inst, index) => `${index + 1}. ${inst}`).join('\n')}

⏰ 조리 시간: ${recipe.cookingTime}분
📊 난이도: ${difficultyInfo.text}

${recipe.link ? `🔗 참고 링크: ${recipe.link}` : ''}

- Fresco 앱에서 공유됨 -
      `.trim();

      await Share.share({
        message: shareContent,
        title: `레시피: ${recipe.title}`,
      });
    } catch (error) {
      console.error('공유 실패:', error);
    }
  };

  // 레시피 편집
  const handleEdit = () => {
    navigation.navigate('RecipeEditScreen', {
      recipe,
      folderId: recipe.folderId,
      fridgeId,
      fridgeName,
    });
  };

  // 링크 열기
  const openLink = () => {
    if (recipe.link) {
      Linking.openURL(recipe.link).catch(() => {
        Alert.alert('오류', '링크를 열 수 없습니다.');
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 커스텀 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleFavorite}
          >
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={24}
              color={isFavorite ? '#F44336' : '#333'}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <MaterialIcons name="share" size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <MaterialIcons name="edit" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 레시피 이미지 */}
        <View style={styles.imageSection}>
          {recipe.image ? (
            <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons name="restaurant" size={48} color="#CCC" />
            </View>
          )}

          {recipe.isAIGenerated && (
            <View style={styles.aiTag}>
              <MaterialIcons name="auto-awesome" size={16} color="#FFF" />
              <CustomText
                size={12}
                color="#FFF"
                weight="bold"
                style={{ marginLeft: 4 }}
              >
                AI 생성
              </CustomText>
            </View>
          )}
        </View>

        {/* 레시피 기본 정보 */}
        <View style={styles.infoSection}>
          <CustomText
            weight="bold"
            size={24}
            color="#333"
            style={{ marginBottom: 8 }}
          >
            {recipe.title}
          </CustomText>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={20} color="#666" />
              <CustomText size={14} color="#666" style={{ marginLeft: 4 }}>
                {recipe.cookingTime}분
              </CustomText>
            </View>

            <View style={styles.metaItem}>
              <MaterialIcons
                name={difficultyInfo.icon}
                size={20}
                color={difficultyInfo.color}
              />
              <CustomText size={14} color="#666" style={{ marginLeft: 4 }}>
                {difficultyInfo.text}
              </CustomText>
            </View>

            <View style={styles.metaItem}>
              <MaterialIcons name="restaurant-menu" size={20} color="#666" />
              <CustomText size={14} color="#666" style={{ marginLeft: 4 }}>
                {recipe.ingredients.length}가지 재료
              </CustomText>
            </View>
          </View>

          {/* 참고 링크 */}
          {recipe.link && (
            <TouchableOpacity style={styles.linkButton} onPress={openLink}>
              <MaterialIcons name="link" size={16} color="#007AFF" />
              <CustomText size={14} color="#007AFF" style={{ marginLeft: 4 }}>
                참고 링크 보기
              </CustomText>
              <MaterialIcons
                name="open-in-new"
                size={16}
                color="#007AFF"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* 재료 목록 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="shopping-basket" size={24} color="#FF6B35" />
            <CustomText
              weight="bold"
              size={18}
              color="#333"
              style={{ marginLeft: 8 }}
            >
              재료 ({recipe.ingredients.length}가지)
            </CustomText>
          </View>

          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientNumber}>
                  <CustomText size={12} color="#FFF" weight="medium">
                    {index + 1}
                  </CustomText>
                </View>
                <CustomText size={15} color="#333" style={{ flex: 1 }}>
                  {ingredient}
                </CustomText>
              </View>
            ))}
          </View>
        </View>

        {/* 조리 방법 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="menu-book" size={24} color="#4CAF50" />
            <CustomText
              weight="bold"
              size={18}
              color="#333"
              style={{ marginLeft: 8 }}
            >
              조리 방법
            </CustomText>
          </View>

          <View style={styles.instructionsList}>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <CustomText size={14} color="#FFF" weight="bold">
                    {index + 1}
                  </CustomText>
                </View>
                <View style={styles.instructionContent}>
                  <CustomText size={15} color="#333" style={{ lineHeight: 22 }}>
                    {instruction}
                  </CustomText>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* 하단 액션 버튼들 */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <MaterialIcons name="share" size={20} color="#007AFF" />
          <CustomText
            size={14}
            color="#007AFF"
            weight="medium"
            style={{ marginLeft: 4 }}
          >
            공유하기
          </CustomText>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
          <MaterialIcons name="edit" size={20} color="#007AFF" />
          <CustomText
            size={14}
            color="#007AFF"
            weight="medium"
            style={{ marginLeft: 4 }}
          >
            편집하기
          </CustomText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RecipeDetailScreen;
