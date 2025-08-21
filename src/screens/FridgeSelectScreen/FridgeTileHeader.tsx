import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BackButton from '../../components/common/BackButton';
import { User } from '../../types/auth';
import { styles } from './styles';

interface FridgeHeaderProps {
  currentUser: User;
  isEditMode: boolean;
  onLogout: () => void;
  onEditToggle: () => void;
}

export const FridgeHeader: React.FC<FridgeHeaderProps> = ({
  currentUser,
  isEditMode,
  onLogout,
  onEditToggle,
}) => {
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
        <TouchableOpacity onPress={onEditToggle}>
          {isEditMode ? (
            <Text style={styles.saveButton}>완료</Text>
          ) : (
            <Text style={styles.editButton}>편집하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
