import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RecipeIngredient } from '../../screens/RecipeScreen/RecipeNavigator';
import { styles } from './styles';

interface IngredientsSectionProps {
  ingredients: RecipeIngredient[];
  isEditMode: boolean;
  onAddIngredient: () => void;
  onRemoveIngredient: (id: string) => void;
  onUpdateIngredient: (
    id: string,
    field: keyof RecipeIngredient,
    value: string,
  ) => void;
}

export const IngredientsSection: React.FC<IngredientsSectionProps> = ({
  ingredients,
  isEditMode,
  onAddIngredient,
  onRemoveIngredient,
  onUpdateIngredient,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>재료</Text>
        {isEditMode && (
          <TouchableOpacity style={styles.addButton} onPress={onAddIngredient}>
            <Icon name="add" size={20} color="#29a448ff" />
            <Text style={styles.addButtonText}>재료 추가</Text>
          </TouchableOpacity>
        )}
      </View>

      {ingredients.map((ingredient, _index) => (
        <View key={ingredient.id} style={styles.ingredientItem}>
          {isEditMode ? (
            <View style={styles.ingredientEditRow}>
              <TextInput
                style={[styles.ingredientInput, styles.ingredientName]}
                value={ingredient.name}
                onChangeText={text =>
                  onUpdateIngredient(ingredient.id, 'name', text)
                }
                placeholder="재료명"
                placeholderTextColor="#999"
              />
              <TextInput
                style={[styles.ingredientInput, styles.ingredientQuantity]}
                value={ingredient.quantity}
                onChangeText={text =>
                  onUpdateIngredient(ingredient.id, 'quantity', text)
                }
                placeholder="양"
                placeholderTextColor="#999"
              />
              <TextInput
                style={[styles.ingredientInput, styles.ingredientUnit]}
                value={ingredient.unit}
                onChangeText={text =>
                  onUpdateIngredient(ingredient.id, 'unit', text)
                }
                placeholder="단위"
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemoveIngredient(ingredient.id)}
              >
                <Icon name="remove" size={20} color="tomato" />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.ingredientText}>
              • {ingredient.name} {ingredient.quantity}
              {ingredient.unit}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};
