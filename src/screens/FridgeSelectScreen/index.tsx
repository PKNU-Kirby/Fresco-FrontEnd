import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Text,
  Alert,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AsyncStorageService,
  FridgeWithRole,
} from '../../services/AsyncStorageService';
import { User } from '../../types/auth';
import FridgeTile from './FridgeTile';
import Icon from 'react-native-vector-icons/FontAwesome6';
import BackButton from '../../components/common/BackButton';
import FridgeModalForm from '../../components/modals/FridgeModalForm';
import { RootStackParamList } from '../../../App';
import { styles, fridgeTileStyles } from './styles';

const FridgeSelectScreen = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [fridges, setFridges] = useState<FridgeWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingFridge, setEditingFridge] = useState<FridgeWithRole | null>(
    null,
  );
  const [bottomSheetHeight] = useState(new Animated.Value(80));
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [draggedFridge, setDraggedFridge] = useState<FridgeWithRole | null>(
    null,
  );
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 초기 데이터 로드
  useEffect(() => {
    initializeData();
  }, []);

  // 화면 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      if (currentUser) {
        loadUserFridges();
      }
    }, [currentUser]),
  );

  const initializeData = async () => {
    try {
      setLoading(true);

      // 개발 모드에서 테스트 데이터 초기화 (필요시)
      // await AsyncStorageService.clearAllData();
      // await AsyncStorageService.initializeTestData();

      // 현재 사용자 로드
      const userId = await AsyncStorageService.getCurrentUserId();
      if (!userId) {
        navigation.replace('Login');
        return;
      }

      const user = await AsyncStorageService.getUserById(userId);
      if (!user) {
        navigation.replace('Login');
        return;
      }

      setCurrentUser(user);

      // 사용자의 냉장고 목록 로드
      const userFridges = await AsyncStorageService.getUserRefrigerators(
        parseInt(userId, 10),
      );
      setFridges(userFridges);
    } catch (error) {
      console.error('Initialize data error:', error);
      Alert.alert('오류', '데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserFridges = async () => {
    if (!currentUser) return;

    try {
      const userFridges = await AsyncStorageService.getUserRefrigerators(
        parseInt(currentUser.id, 10),
      );
      setFridges(userFridges);
    } catch (error) {
      console.error('Load user fridges error:', error);
    }
  };

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

  const handleAddFridge = () => {
    setIsAddModalVisible(true);
  };

  const handleEditToggle = () => {
    setIsEditMode(prev => {
      const newEditMode = !prev;
      if (!newEditMode) {
        setIsBottomSheetExpanded(false);
        bottomSheetHeight.setValue(80);
      }
      return newEditMode;
    });
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
                  fridge.id,
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
                fridge.id,
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
        fridge.id,
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

  // 드래그 앤 드롭 핸들러들
  const handleDragStart = (fridge: FridgeWithRole) => {
    setDraggedFridge(fridge);
  };

  const handleDragMove = (x: number, y: number) => {
    // 드래그 위치에 따라 어느 타일 위에 있는지 계산
    // 실제 구현에서는 각 타일의 위치를 계산해서 draggedOverIndex 설정
    // 여기서는 간단한 예시만 제공
  };

  const handleDragEnd = () => {
    if (draggedFridge && draggedOverIndex !== null) {
      // 냉장고 순서 변경 로직 구현
      const newFridges = [...fridges];
      const draggedIndex = newFridges.findIndex(f => f.id === draggedFridge.id);

      if (draggedIndex !== -1 && draggedIndex !== draggedOverIndex) {
        // 배열에서 드래그된 항목 제거하고 새 위치에 삽입
        const [removed] = newFridges.splice(draggedIndex, 1);
        newFridges.splice(draggedOverIndex, 0, removed);

        setFridges(newFridges);

        // AsyncStorage에 순서 저장 (실제 구현 필요)
        // await AsyncStorageService.updateFridgeOrder(currentUser.id, newFridges);
      }
    }

    setDraggedFridge(null);
    setDraggedOverIndex(null);
  };

  const handleCloseModal = () => {
    setIsAddModalVisible(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setEditingFridge(null);
  };

  const handleUpdateFridge = async (updatedData: { name: string }) => {
    if (!editingFridge) return;

    try {
      const updatedFridge = await AsyncStorageService.updateRefrigerator(
        editingFridge.id,
        { name: updatedData.name },
      );

      if (updatedFridge) {
        await loadUserFridges();
        Alert.alert('성공', '냉장고 정보가 업데이트되었습니다.');
        handleCloseEditModal();
      } else {
        Alert.alert('오류', '냉장고 정보 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('Update fridge error:', error);
      Alert.alert('오류', '냉장고 정보 업데이트에 실패했습니다.');
    }
  };

  const handleAddFridgeData = async (fridgeData: { name: string }) => {
    if (!currentUser) return;

    try {
      const result = await AsyncStorageService.createRefrigerator(
        fridgeData.name,
        parseInt(currentUser.id, 10),
      );

      if (result) {
        await loadUserFridges();
        Alert.alert('성공', '새 냉장고가 생성되었습니다.');
        handleCloseModal();
      }
    } catch (error) {
      console.error('Add fridge error:', error);
      Alert.alert('오류', '냉장고 생성에 실패했습니다.');
    }
  };

  const toggleBottomSheet = () => {
    const newExpanded = !isBottomSheetExpanded;
    setIsBottomSheetExpanded(newExpanded);

    bottomSheetHeight.stopAnimation(() => {
      Animated.timing(bottomSheetHeight, {
        toValue: newExpanded ? 750 : 80,
        duration: 500,
        useNativeDriver: false,
      }).start();
    });
  };

  const getFridgeTiles = () => {
    const visibleFridges = fridges.filter(f => !f.isHidden);
    const tiles = [...visibleFridges];

    if (isEditMode) {
      if (tiles.length % 2 === 0) {
        tiles.push({ id: -1, name: 'TRANSPARENT', isHidden: false } as any);
        tiles.push({ id: -2, name: 'PLUS', isHidden: false } as any);
      } else if (tiles.length % 2 === 1) {
        tiles.push({ id: -1, name: 'PLUS', isHidden: false } as any);
      }
    } else {
      if (tiles.length % 2 === 1) {
        tiles.push({ id: -3, name: 'TRANSPARENT', isHidden: false } as any);
      }
    }

    return tiles;
  };

  const getHiddenFridgeTiles = () => {
    if (!isEditMode) {
      return [];
    }

    const hiddenFridges = fridges.filter(f => f.isHidden);
    const tiles = [...hiddenFridges];

    if (tiles.length % 2 === 1) {
      tiles.push({ id: -4, name: 'TRANSPARENT_HIDDEN', isHidden: true } as any);
    }

    return tiles;
  };

  if (loading || !currentUser) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>냉장고 목록을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <BackButton onPress={handleLogout} />
          </View>
          <View style={styles.centerHeader}>
            <Text style={styles.headerTitle}>
              <Text style={styles.userName}>{currentUser.name}</Text> 님의 모임
            </Text>
          </View>
          <View style={styles.rightHeader}>
            <TouchableOpacity onPress={handleEditToggle}>
              {isEditMode ? (
                <Text style={styles.saveButton}>완료</Text>
              ) : (
                <Text style={styles.editButton}>편집하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Fridge Tiles List */}
        <View style={styles.fridgeTilesListContainer}>
          <FlatList
            data={getFridgeTiles()}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.list}
            columnWrapperStyle={{ justifyContent: 'center' }}
            renderItem={({ item, index }) => {
              if (isEditMode && item.id === -2) {
                return <View style={[fridgeTileStyles.tile, { opacity: 0 }]} />;
              } else if (isEditMode && item.id === -1) {
                return (
                  <View style={fridgeTileStyles.plusTile}>
                    <TouchableOpacity
                      style={fridgeTileStyles.plusButton}
                      onPress={handleAddFridge}
                    >
                      <View style={fridgeTileStyles.plusIcon}>
                        <Icon name="plus" size={32} color="#f8f8f8" />
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              } else if (!isEditMode && item.id === -3) {
                return <View style={[fridgeTileStyles.tile, { opacity: 0 }]} />;
              } else {
                return (
                  <FridgeTile
                    fridge={item}
                    isEditMode={isEditMode}
                    isHidden={false}
                    onEdit={isEditMode ? handleEditFridge : undefined}
                    onLeave={isEditMode ? handleLeaveFridge : undefined}
                    onToggleHidden={isEditMode ? handleToggleHidden : undefined}
                    onDragStart={!isEditMode ? handleDragStart : undefined}
                    onDragEnd={!isEditMode ? handleDragEnd : undefined}
                    onDragMove={!isEditMode ? handleDragMove : undefined}
                    isDragging={draggedFridge?.id === item.id}
                    draggedOver={draggedOverIndex === index}
                  />
                );
              }
            }}
          />
        </View>

        {/* Hidden Fridges Bottom Sheet */}
        {isEditMode && (
          <Animated.View
            style={[styles.bottomSheet, { height: bottomSheetHeight }]}
          >
            <TouchableOpacity
              style={styles.bottomSheetHeader}
              onPress={toggleBottomSheet}
            >
              <View style={styles.dragHandle} />
              <Text style={styles.bottomSheetTitle}>
                숨긴 냉장고{' '}
                {getHiddenFridgeTiles().filter(f => f.id > 0).length}개
              </Text>
            </TouchableOpacity>

            {isBottomSheetExpanded && (
              <View style={styles.bottomSheetContent}>
                <FlatList
                  data={getHiddenFridgeTiles()}
                  keyExtractor={item => item.id.toString()}
                  numColumns={2}
                  columnWrapperStyle={{ justifyContent: 'center' }}
                  renderItem={({ item }) => {
                    if (item.id === -4) {
                      return (
                        <View style={[fridgeTileStyles.tile, { opacity: 0 }]} />
                      );
                    } else {
                      return (
                        <FridgeTile
                          fridge={item}
                          isEditMode={isEditMode}
                          isHidden={true}
                          onEdit={handleEditFridge}
                          onLeave={handleLeaveFridge}
                          onToggleHidden={handleToggleHidden}
                        />
                      );
                    }
                  }}
                />
              </View>
            )}
          </Animated.View>
        )}

        {/* Modals */}
        {isAddModalVisible && (
          <FridgeModalForm
            onClose={handleCloseModal}
            onAddFridge={handleAddFridgeData}
          />
        )}

        {isEditModalVisible && editingFridge && (
          <FridgeModalForm
            onClose={handleCloseEditModal}
            onAddFridge={handleUpdateFridge}
            editMode={true}
            initialFridge={editingFridge}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default FridgeSelectScreen;
