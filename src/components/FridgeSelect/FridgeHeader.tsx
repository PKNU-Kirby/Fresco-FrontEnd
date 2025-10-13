import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { User } from '../../types/auth';
import BackButton from '../_common/BackButton';
import { fridgeHeaderStyles as styles } from './styles';

interface FridgeHeaderProps {
  currentUser: User;
  isEditMode: boolean;
  hasChanges?: boolean;
  onLogout: () => void;
  onEditToggle: () => void;
  onSaveChanges?: () => Promise<void>;
}

export const FridgeHeader: React.FC<FridgeHeaderProps> = ({
  currentUser,
  isEditMode,
  hasChanges = false,
  onLogout,
  onEditToggle,
  onSaveChanges,
}) => {
  const handleEditToggle = () => {
    if (isEditMode && onSaveChanges && hasChanges) {
      // 편집 모드에서 변경사항이 있을 때는 저장
      onSaveChanges();
    } else {
      // 일반 토글
      onEditToggle();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftHeader}>
        <BackButton onPress={onLogout} />
      </View>

      <View style={styles.centerHeader}>
        <Text style={styles.headerTitle}>
          <Text style={styles.userName}>{currentUser.name}</Text> 님의 모임
        </Text>
      </View>

      <View style={styles.rightHeader}>
        <TouchableOpacity onPress={handleEditToggle}>
          {isEditMode ? (
            <Text style={[styles.saveButton]}>완료</Text>
          ) : (
            <Text style={styles.editButton}>편집하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
