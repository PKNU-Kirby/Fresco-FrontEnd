import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { styles } from './styles';

interface HeaderProps {
  isEditMode: boolean;
  isNewRecipe: boolean;
  isSharedRecipe: boolean;
  isFavorite: boolean;
  isLoading: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onGoBack: () => void;
  onSave: () => void;
  onToggleFavorite: () => void;
  onEdit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isEditMode,
  isNewRecipe,
  isSharedRecipe,
  isFavorite,
  isLoading,
  canEdit = true,
  canDelete = true,
  onGoBack,
  onSave,
  onToggleFavorite,
  onEdit,
}) => {
  return (
    <View style={styles.header}>
      {isEditMode ? (
        <View style={styles.leftEditHeader}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Icon name="arrow-back" size={24} color="#444" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.leftHeader}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Icon name="arrow-back" size={24} color="#444" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.centerHeader}>
        <Text style={styles.headerTitle}>
          {isNewRecipe
            ? '새 레시피'
            : isEditMode
            ? '레시피 편집'
            : '레시피 상세'}
        </Text>
      </View>

      {isEditMode ? (
        <View style={styles.rightEditHeader}>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={onSave}
              disabled={isLoading}
            >
              <FontAwesome6 name="circle-check" size={24} color="#444" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.rightHeader}>
          {!isSharedRecipe ? (
            <View style={styles.headerActions}>
              {/* 개인 레시피: 즐겨찾기 + 수정 버튼 */}
              <>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={onToggleFavorite}
                >
                  <Icon
                    name={isFavorite ? 'star' : 'star-border'}
                    size={24}
                    color={isFavorite ? '#ffd000' : '#999'}
                  />
                </TouchableOpacity>

                {/* 👇 수정 버튼: canEdit이 true일 때만 표시 */}
                {canEdit && (
                  <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                    <Icon name="edit" size={24} color="#333" />
                  </TouchableOpacity>
                )}
              </>
            </View>
          ) : (
            // 👇 공유 레시피: 빈 영역 (버튼 없음)
            <View style={styles.headerActions} />
          )}
        </View>
      )}
    </View>
  );
};
