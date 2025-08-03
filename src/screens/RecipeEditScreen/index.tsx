import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../components/common/CustomText';
import { RootStackParamList } from '../../../App';
import { Recipe } from '../RecipeScreen';
import { styles } from './styles';

type RecipeEditScreenRouteProp = RouteProp<
  RootStackParamList,
  'RecipeEditScreen'
>;
// RootStackParamList를 사용하여 모든 스크린에 접근 가능하도록 변경
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RecipeEditScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RecipeEditScreenRouteProp>();

  const { recipe, folderId, fridgeId, fridgeName } = route.params;
  const isEditing = !!recipe;

  // 폼 상태
  const [title, setTitle] = useState(recipe?.title || '');
  const [ingredients, setIngredients] = useState<string[]>(
    recipe?.ingredients || [''],
  );
  const [instructions, setInstructions] = useState<string[]>(
    recipe?.instructions || [''],
  );
  const [cookingTime, setCookingTime] = useState(
    recipe?.cookingTime?.toString() || '',
  );
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    recipe?.difficulty || 'easy',
  );
  const [link, setLink] = useState(recipe?.link || '');
  const [image, setImage] = useState(recipe?.image || '');
  const [isSaving, setIsSaving] = useState(false);

  // CameraScreen에서 돌아올 때 사진 확인
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // TODO: CameraScreen에서 촬영된 사진 데이터 받아오기
      // AsyncStorage나 navigation params를 통해 전달받을 수 있음
    });

    return unsubscribe;
  }, [navigation]);

  // 뒤로가기 처리
  const handleBack = () => {
    if (hasChanges()) {
      Alert.alert(
        '변경사항 저장',
        '변경된 내용이 있습니다. 저장하지 않고 나가시겠습니까?',
        [
          { text: '저장하고 나가기', onPress: handleSave },
          {
            text: '저장하지 않기',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
          { text: '취소', style: 'cancel' },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  // 변경사항 확인
  const hasChanges = (): boolean => {
    if (!isEditing)
      return title.trim() !== '' || ingredients.some(ing => ing.trim() !== '');

    return (
      title !== recipe.title ||
      JSON.stringify(ingredients) !== JSON.stringify(recipe.ingredients) ||
      JSON.stringify(instructions) !== JSON.stringify(recipe.instructions) ||
      cookingTime !== recipe.cookingTime.toString() ||
      difficulty !== recipe.difficulty ||
      link !== (recipe.link || '') ||
      image !== (recipe.image || '')
    );
  };

  // 재료 관리
  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  // 조리방법 관리
  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  // 이미지 선택
  const selectImage = () => {
    const options = {
      title: '레시피 사진 선택',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    Alert.alert('사진 선택', '레시피 사진을 어떻게 추가하시겠습니까?', [
      { text: '카메라', onPress: () => openImagePicker('camera') },
      { text: '갤러리', onPress: () => openImagePicker('library') },
      { text: '취소', style: 'cancel' },
    ]);
  };

  const openImagePicker = (sourceType: 'camera' | 'library') => {
    console.log('이미지 선택:', sourceType);

    if (sourceType === 'camera') {
      // 타입 단언으로 CameraScreen 네비게이션
      (navigation as any).navigate('CameraScreen', {
        fridgeId,
        onUse: (photoUri: string) => {
          setImage(photoUri);
        },
      });
    } else {
      // 임시로 플레이스홀더 이미지 설정
      setImage(
        'https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Gallery+Image',
      );
    }
  };

  // 이미지 제거
  const removeImage = () => {
    setImage('');
  };

  // 유효성 검사
  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('알림', '레시피 제목을 입력해주세요.');
      return false;
    }

    const filteredIngredients = ingredients.filter(ing => ing.trim() !== '');
    if (filteredIngredients.length === 0) {
      Alert.alert('알림', '재료를 하나 이상 입력해주세요.');
      return false;
    }

    const filteredInstructions = instructions.filter(
      inst => inst.trim() !== '',
    );
    if (filteredInstructions.length === 0) {
      Alert.alert('알림', '조리 방법을 하나 이상 입력해주세요.');
      return false;
    }

    return true;
  };

  // 저장
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const filteredIngredients = ingredients.filter(ing => ing.trim() !== '');
      const filteredInstructions = instructions.filter(
        inst => inst.trim() !== '',
      );

      const recipeData: Recipe = {
        id: recipe?.id || Date.now().toString(),
        title: title.trim(),
        ingredients: filteredIngredients,
        instructions: filteredInstructions,
        cookingTime: parseInt(cookingTime) || 30,
        difficulty,
        image: image || undefined,
        link: link.trim() || undefined,
        isAIGenerated: recipe?.isAIGenerated || false,
        folderId,
        createdAt: recipe?.createdAt || new Date(),
      };

      // TODO: 실제 저장 로직 구현
      console.log('레시피 저장:', recipeData);
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        '저장 완료',
        `레시피가 ${isEditing ? '수정' : '저장'}되었습니다.`,
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.error('레시피 저장 실패:', error);
      Alert.alert('오류', '레시피 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 커스텀 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <MaterialIcons name="close" size={24} color="#333" />
        </TouchableOpacity>

        <CustomText weight="bold" size={18} color="#333">
          {isEditing ? '레시피 편집' : '새 레시피'}
        </CustomText>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <CustomText weight="bold" size={16} color="#007AFF">
            {isSaving ? '저장 중...' : '저장'}
          </CustomText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 이미지 섹션 */}
        <View style={styles.section}>
          <CustomText
            weight="bold"
            size={16}
            color="#333"
            style={{ marginBottom: 12 }}
          >
            레시피 사진
          </CustomText>

          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.recipeImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={removeImage}
              >
                <MaterialIcons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={selectImage}
            >
              <MaterialIcons name="add-a-photo" size={32} color="#999" />
              <CustomText size={14} color="#999" style={{ marginTop: 8 }}>
                사진 추가하기
              </CustomText>
            </TouchableOpacity>
          )}
        </View>

        {/* 기본 정보 */}
        <View style={styles.section}>
          <CustomText
            weight="bold"
            size={16}
            color="#333"
            style={{ marginBottom: 8 }}
          >
            레시피 제목 *
          </CustomText>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="맛있는 레시피 제목을 입력하세요"
            placeholderTextColor="#999"
          />
        </View>

        {/* 조리 정보 */}
        <View style={styles.row}>
          <View style={styles.halfSection}>
            <CustomText
              weight="bold"
              size={16}
              color="#333"
              style={{ marginBottom: 8 }}
            >
              조리시간 (분) *
            </CustomText>
            <TextInput
              style={styles.input}
              value={cookingTime}
              onChangeText={setCookingTime}
              placeholder="30"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.halfSection}>
            <CustomText
              weight="bold"
              size={16}
              color="#333"
              style={{ marginBottom: 8 }}
            >
              난이도 *
            </CustomText>
            <View style={styles.difficultyRow}>
              {(['easy', 'medium', 'hard'] as const).map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.difficultyButton,
                    difficulty === level && styles.difficultyButtonSelected,
                  ]}
                  onPress={() => setDifficulty(level)}
                >
                  <CustomText
                    size={12}
                    color={difficulty === level ? '#FFFFFF' : '#666'}
                    weight={difficulty === level ? 'bold' : 'regular'}
                  >
                    {level === 'easy'
                      ? '쉬움'
                      : level === 'medium'
                      ? '보통'
                      : '어려움'}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 재료 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CustomText weight="bold" size={16} color="#333">
              재료 *
            </CustomText>
            <TouchableOpacity onPress={addIngredient}>
              <MaterialIcons name="add-circle" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listNumber}>
                <CustomText size={12} color="#FFF" weight="medium">
                  {index + 1}
                </CustomText>
              </View>
              <TextInput
                style={styles.listInput}
                value={ingredient}
                onChangeText={value => updateIngredient(index, value)}
                placeholder="재료를 입력하세요 (예: 양파 1개)"
                placeholderTextColor="#999"
              />
              {ingredients.length > 1 && (
                <TouchableOpacity onPress={() => removeIngredient(index)}>
                  <MaterialIcons
                    name="remove-circle"
                    size={20}
                    color="#F44336"
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* 조리방법 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CustomText weight="bold" size={16} color="#333">
              조리방법 *
            </CustomText>
            <TouchableOpacity onPress={addInstruction}>
              <MaterialIcons name="add-circle" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {instructions.map((instruction, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listNumber}>
                <CustomText size={12} color="#FFF" weight="medium">
                  {index + 1}
                </CustomText>
              </View>
              <TextInput
                style={[styles.listInput, styles.multilineInput]}
                value={instruction}
                onChangeText={value => updateInstruction(index, value)}
                placeholder="조리 단계를 자세히 입력하세요"
                placeholderTextColor="#999"
                multiline
                numberOfLines={2}
              />
              {instructions.length > 1 && (
                <TouchableOpacity onPress={() => removeInstruction(index)}>
                  <MaterialIcons
                    name="remove-circle"
                    size={20}
                    color="#F44336"
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* 참고 링크 */}
        <View style={styles.section}>
          <CustomText
            weight="bold"
            size={16}
            color="#333"
            style={{ marginBottom: 8 }}
          >
            참고 링크 (선택)
          </CustomText>
          <TextInput
            style={styles.input}
            value={link}
            onChangeText={setLink}
            placeholder="유튜브, 블로그 등 참고 링크 (선택사항)"
            placeholderTextColor="#999"
            keyboardType="url"
          />
          <CustomText size={12} color="#999" style={{ marginTop: 4 }}>
            * YouTube, 블로그, 레시피 사이트 등의 링크를 추가할 수 있습니다
          </CustomText>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default RecipeEditScreen;
