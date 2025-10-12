import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';

interface CheckableIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  isChecked: boolean;
}

interface UseRecipeModalProps {
  visible: boolean;
  ingredients: CheckableIngredient[];
  onClose: () => void;
  onToggleIngredient: (id: string) => void;
  onDeleteCheckedIngredients: () => void;
}

export const UseRecipeModal: React.FC<UseRecipeModalProps> = ({
  visible,
  ingredients,
  onClose,
  onToggleIngredient,
  onDeleteCheckedIngredients,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>레시피 사용하기</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modalContent}>
          <Text style={styles.modalSubtitle}>
            사용한 재료를 체크하면 냉장고에서 차감됩니다
          </Text>

          <FlatList
            data={ingredients}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.checklistItem}
                onPress={() => onToggleIngredient(item.id)}
              >
                <Icon
                  name={
                    item.isChecked ? 'check-box' : 'check-box-outline-blank'
                  }
                  size={24}
                  color={item.isChecked ? 'limegreen' : '#999'}
                />
                <Text
                  style={[
                    styles.checklistText,
                    item.isChecked && styles.checkedText,
                  ]}
                >
                  {item.name} {item.quantity}
                  {item.unit}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.checklistContainer}
          />

          <TouchableOpacity
            style={styles.modalActionButton}
            onPress={onDeleteCheckedIngredients}
          >
            <Text style={styles.modalActionButtonText}>차감하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
