import { Alert } from 'react-native';
import {
  AsyncStorageService,
  FridgeWithRole,
} from '../services/AsyncStorageService';
import { User } from '../types/auth';

interface UseFridgeActionsParams {
  currentUser: User | null;
  loadUserFridges: () => Promise<void>;
  setEditingFridge: (fridge: FridgeWithRole | null) => void;
  setIsEditModalVisible: (visible: boolean) => void;
  setIsAddModalVisible: (visible: boolean) => void;
  editingFridge: FridgeWithRole | null;
  navigation: any;
}

export const useFridgeActions = ({
  currentUser,
  loadUserFridges,
  setEditingFridge,
  setIsEditModalVisible,
  setIsAddModalVisible,
  editingFridge,
  navigation,
}: UseFridgeActionsParams) => {
  const handleLogout = async () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorageService.clearCurrentUser();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const handleEditFridge = (fridge: FridgeWithRole) => {
    if (!fridge.isOwner) {
      Alert.alert('알림', '냉장고 소유자만 편집할 수 있습니다.');
      return;
    }
    setEditingFridge(fridge);
    setIsEditModalVisible(true);
  };

  const handleLeaveFridge = async (fridge: FridgeWithRole) => {
    if (!currentUser) return;

    if (fridge.isOwner) {
      Alert.alert(
        '냉장고 삭제',
        `${fridge.name}을(를) 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제',
            style: 'destructive',
            onPress: async () => {
              try {
                const success = await AsyncStorageService.deleteRefrigerator(
                  parseInt(fridge.id, 10),
                );
                if (success) {
                  await loadUserFridges();
                  Alert.alert('성공', '냉장고가 삭제되었습니다.');
                } else {
                  Alert.alert('오류', '냉장고 삭제에 실패했습니다.');
                }
              } catch (error) {
                console.error('Delete fridge error:', error);
                Alert.alert('오류', '냉장고 삭제에 실패했습니다.');
              }
            },
          },
        ],
      );
      return;
    }

    Alert.alert('냉장고 나가기', `${fridge.name}에서 나가시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: async () => {
          try {
            const success =
              await AsyncStorageService.removeUserFromRefrigerator(
                parseInt(fridge.id, 10),
                parseInt(currentUser.id, 10),
              );
            if (success) {
              await loadUserFridges();
              Alert.alert('성공', '냉장고에서 나왔습니다.');
            } else {
              Alert.alert('오류', '냉장고 나가기에 실패했습니다.');
            }
          } catch (error) {
            console.error('Leave fridge error:', error);
            Alert.alert('오류', '냉장고 나가기에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleToggleHidden = async (fridge: FridgeWithRole) => {
    if (!currentUser) return;

    try {
      await AsyncStorageService.setFridgeHidden(
        parseInt(currentUser.id, 10),
        parseInt(fridge.id, 10),
        !fridge.isHidden,
      );
      await loadUserFridges();

      const message = fridge.isHidden
        ? '냉장고를 표시했습니다.'
        : '냉장고를 숨겼습니다.';
      Alert.alert('성공', message);
    } catch (error) {
      console.error('Toggle hidden error:', error);
      Alert.alert('오류', '냉장고 숨김 설정에 실패했습니다.');
    }
  };

  const handleAddFridge = async (fridgeData: { name: string }) => {
    if (!currentUser) return;

    try {
      const result = await AsyncStorageService.createRefrigerator(
        fridgeData.name,
        parseInt(currentUser.id, 10),
      );

      if (result) {
        await loadUserFridges();
        Alert.alert('성공', '새 냉장고가 생성되었습니다.');
        setIsAddModalVisible(false);
      }
    } catch (error) {
      console.error('Add fridge error:', error);
      Alert.alert('오류', '냉장고 생성에 실패했습니다.');
    }
  };

  const handleUpdateFridge = async (updatedData: { name: string }) => {
    if (!currentUser || !editingFridge) return;

    try {
      await AsyncStorageService.updateRefrigerator(
        parseInt(editingFridge.id, 10),
        {
          name: updatedData.name,
        },
      );

      await loadUserFridges();
      Alert.alert('성공', '냉장고 정보가 업데이트되었습니다.');
      setIsEditModalVisible(false);
      setEditingFridge(null);
    } catch (error) {
      console.error('Update fridge error:', error);
      Alert.alert('오류', '냉장고 정보 업데이트에 실패했습니다.');
    }
  };

  return {
    handleLogout,
    handleEditFridge,
    handleLeaveFridge,
    handleToggleHidden,
    handleAddFridge,
    handleUpdateFridge,
  };
};
