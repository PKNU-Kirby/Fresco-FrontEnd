import React, { useState } from 'react';
import {
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Text,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ConfirmModal from '../ConfirmModal';
import type {
  Recipe,
  RecipeFolder,
} from '../../../screens/RecipeScreen/RecipeNavigator';
import { createModalStyles } from './styles';

interface CreateRecipeModalProps {
  visible: boolean;
  onClose: () => void;
  folders: RecipeFolder[];
  onSave: (recipe: Recipe) => void;
}

export const CreateRecipeModal: React.FC<CreateRecipeModalProps> = ({
  visible,
  onClose,
  folders,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);
  const [cookingTime, setCookingTime] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    'easy',
  );
  const [selectedFolderId, setSelectedFolderId] = useState(
    folders[0]?.id || '',
  );
  const [link, setLink] = useState('');

  // 알림 모달 상태들 추가
  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: '',
    message: '',
  });

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

  // Alert 대신 ConfirmModal 사용하도록 수정
  const showAlert = (title: string, message: string) => {
    setAlertModal({
      visible: true,
      title,
      message,
    });
  };

  const hideAlert = () => {
    setAlertModal({
      visible: false,
      title: '',
      message: '',
    });
  };

  const handleSave = () => {
    if (!title.trim()) {
      showAlert('알림', '레시피 제목을 입력해주세요.');
      return;
    }

    const filteredIngredients = ingredients.filter(ing => ing.trim() !== '');
    const filteredInstructions = instructions.filter(
      inst => inst.trim() !== '',
    );

    if (filteredIngredients.length === 0) {
      showAlert('알림', '재료를 하나 이상 입력해주세요.');
      return;
    }

    if (filteredInstructions.length === 0) {
      showAlert('알림', '조리 방법을 하나 이상 입력해주세요.');
      return;
    }

    const newRecipe: Recipe = {
      id: Date.now().toString(),
      title: title.trim(),
      ingredients: filteredIngredients.map(ing => ({
        id: Date.now().toString(),
        name: ing,
        quantity: 1,
        unit: '',
      })),
      instructions: filteredInstructions,
    };

    onSave(newRecipe);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setIngredients(['']);
    setInstructions(['']);
    setCookingTime('');
    setDifficulty('easy');
    setLink('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="fade"
        presentationStyle="overFullScreen"
        onRequestClose={handleClose}
      >
        <View style={createModalStyles.container}>
          {/* 헤더 */}
          <View style={createModalStyles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Text size={16} color="#666">
                취소
              </Text>
            </TouchableOpacity>

            <Text weight="bold" size={18} color="#333">
              레시피 제작
            </Text>

            <TouchableOpacity onPress={handleSave}>
              <Text weight="bold" size={16} color="#007AFF">
                저장
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={createModalStyles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* 제목 */}
            <View style={createModalStyles.section}>
              <Text
                weight="bold"
                size={16}
                color="#333"
                style={{ marginBottom: 8 }}
              >
                제목
              </Text>
              <TextInput
                style={createModalStyles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="레시피 제목을 입력하세요"
                placeholderTextColor="#999"
              />
            </View>

            {/* 폴더 선택 */}
            <View style={createModalStyles.section}>
              <Text
                weight="bold"
                size={16}
                color="#333"
                style={{ marginBottom: 8 }}
              >
                저장할 폴더
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {folders.map(folder => (
                  <TouchableOpacity
                    key={folder.id}
                    style={[
                      createModalStyles.folderChip,
                      selectedFolderId === folder.id &&
                        createModalStyles.folderChipSelected,
                    ]}
                    onPress={() => setSelectedFolderId(folder.id)}
                  >
                    <Text
                      size={14}
                      color={
                        selectedFolderId === folder.id ? '#FFFFFF' : '#666'
                      }
                    >
                      {folder.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 재료 */}
            <View style={createModalStyles.section}>
              <View style={createModalStyles.labelRow}>
                <Text weight="bold" size={16} color="#333">
                  재료
                </Text>
                <TouchableOpacity onPress={addIngredient}>
                  <MaterialIcons name="add" size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>

              {ingredients.map((ingredient, index) => (
                <View key={index} style={createModalStyles.listItem}>
                  <Text
                    size={14}
                    color="#666"
                    style={{ width: 20, textAlign: 'center' }}
                  >
                    {index + 1}
                  </Text>
                  <TextInput
                    style={createModalStyles.listInput}
                    value={ingredient}
                    onChangeText={value => updateIngredient(index, value)}
                    placeholder="재료를 입력하세요"
                    placeholderTextColor="#999"
                  />
                  {ingredients.length > 1 && (
                    <TouchableOpacity onPress={() => removeIngredient(index)}>
                      <MaterialIcons name="remove" size={20} color="#F44336" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* 조리방법 */}
            <View style={createModalStyles.section}>
              <View style={createModalStyles.labelRow}>
                <Text weight="bold" size={16} color="#333">
                  조리방법
                </Text>
                <TouchableOpacity onPress={addInstruction}>
                  <MaterialIcons name="add" size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>

              {instructions.map((instruction, index) => (
                <View key={index} style={createModalStyles.listItem}>
                  <Text
                    size={14}
                    color="#666"
                    style={{ width: 20, textAlign: 'center' }}
                  >
                    {index + 1}
                  </Text>
                  <TextInput
                    style={createModalStyles.listInput}
                    value={instruction}
                    onChangeText={value => updateInstruction(index, value)}
                    placeholder="조리 단계를 입력하세요"
                    placeholderTextColor="#999"
                    multiline
                  />
                  {instructions.length > 1 && (
                    <TouchableOpacity onPress={() => removeInstruction(index)}>
                      <MaterialIcons name="remove" size={20} color="#F44336" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* 링크 */}
            <View style={createModalStyles.section}>
              <Text
                weight="bold"
                size={16}
                color="#333"
                style={{ marginBottom: 8 }}
              >
                참고 링크 (선택)
              </Text>
              <TextInput
                style={createModalStyles.input}
                value={link}
                onChangeText={setLink}
                placeholder="유튜브, 블로그 링크 등"
                placeholderTextColor="#999"
              />
            </View>

            <View style={createModalStyles.bottomPadding} />
          </ScrollView>
        </View>
      </Modal>

      {/* Alert 대신 ConfirmModal 사용 */}
      <ConfirmModal
        isAlert={false}
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{
          name: 'error-outline',
          color: '#FF6B6B',
          size: 48,
        }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={hideAlert}
        onCancel={hideAlert}
      />
    </>
  );
};

export default CreateRecipeModal;
