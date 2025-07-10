import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
// import axios from 'axios';

import CustomText from '../../components/common/CustomText';
import FridgeTile from '../../components/Fridge/FridgeTile';
import FridgeModalForm from '../../components/Fridge/FridgeModalForm';
import {RootStackParamList} from '../../../App';
import fridgeTileStyles from '../../components/Fridge/FridgeTileStyles';
import styles from './styles';

type Fridge = {
  id: number;
  name: string;
  isHidden: boolean;
};

const FridgeSelectScreen = () => {
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingFridge, setEditingFridge] = useState<Fridge | null>(null);
  const [bottomSheetHeight] = useState(new Animated.Value(80)); // 초기 높이 60 (탭 높이)
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Mock data
  useEffect(() => {
    const mockData: Fridge[] = [
      {id: 1, name: '본가', isHidden: false},
      {id: 2, name: '자취방', isHidden: false},
      {id: 3, name: '냉동고', isHidden: false},
      {id: 4, name: '숨김냉장고1', isHidden: true},
    ];
    setFridges(mockData);
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId');
    navigation.replace('Login');
  };

  // LOAD FRIDGE DATA
  const handleAddFridge = () => {
    setIsAddModalVisible(true);
  };

  // TOGGLE EDIT MODE
  const handleEditToggle = () => {
    setIsEditMode(prev => {
      const newEditMode = !prev;
      if (!newEditMode) {
        setIsBottomSheetExpanded(false);
        bottomSheetHeight.setValue(80);
      } else {
        setIsBottomSheetExpanded(false);
        bottomSheetHeight.setValue(80);
      }
      return newEditMode;
    });
  };

  // EDIT FRIDGE
  const handleEditFridge = (fridge: Fridge) => {
    setEditingFridge(fridge);
    setIsEditModalVisible(true);
  };

  // CLOSE ADD MODAL
  const handleCloseModal = () => {
    setIsAddModalVisible(false);
  };

  // CLOSE EDIT MODAL
  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setEditingFridge(null);
  };

  // UPDATE FRIDGE DATA
  const handleUpdateFridge = (updatedFridge: Fridge) => {
    setFridges(prev =>
      prev.map(f => (f.id === updatedFridge.id ? updatedFridge : f)),
    );
  };

  // ADD FRIDGE DATA
  const handleAddFridgeData = (newFridge: Fridge) => {
    setFridges(prev => [...prev, newFridge]);
  };

  // TOGGLE BOTTOM SHEET
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

  // CALC FRIDGE TILES
  const getFridgeTiles = () => {
    const visibleFridges = fridges.filter(f => !f.isHidden);
    const tiles = [...visibleFridges];

    if (isEditMode) {
      if (tiles.length % 2 === 0) {
        tiles.push({id: -1, name: 'TRANSPARENT', isHidden: false});
        tiles.push({id: -2, name: 'PLUS', isHidden: false});
      } else if (tiles.length % 2 === 1) {
        tiles.push({id: -1, name: 'PLUS', isHidden: false});
      }
    } else {
      if (tiles.length % 2 === 1) {
        tiles.push({id: -3, name: 'TRANSPARENT', isHidden: false});
      }
    }

    return tiles;
  };

  // CALC HIDDEN FRIDGE TILES
  const getHiddenFridgeTiles = () => {
    if (!isEditMode) {
      return [];
    }

    const hiddenFridges = fridges.filter(f => f.isHidden);
    const tiles = [...hiddenFridges];

    if (tiles.length % 2 === 1) {
      tiles.push({id: -4, name: 'TRANSPARENT_HIDDEN', isHidden: true});
    }

    return tiles;
  };

  // Loadgin Indicator
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.headerStyle}>
          <TouchableOpacity onPress={handleLogout}>
            <CustomText style={styles.logoutButton}>뒤로가기</CustomText>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEditToggle}>
            <CustomText style={styles.editButton}>
              {isEditMode ? '완료' : '편집'}
            </CustomText>
          </TouchableOpacity>
        </View>

        {/* Fridge Tiles List */}
        <View style={{flex: 1}}>
          <FlatList
            data={getFridgeTiles()}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{justifyContent: 'space-between'}}
            contentContainerStyle={styles.list}
            renderItem={({item}) => {
              if (isEditMode && item.id === -2) {
                return <View style={[fridgeTileStyles.tile, {opacity: 0}]} />;
              } else if (isEditMode && item.id === -1) {
                return (
                  <View style={fridgeTileStyles.plusTile}>
                    <TouchableOpacity
                      style={fridgeTileStyles.plusButton}
                      onPress={handleAddFridge}>
                      {/* Plus Icon */}
                      <View style={fridgeTileStyles.plusIcon}>
                        <View style={fridgeTileStyles.plusHorizontal} />
                        <View style={fridgeTileStyles.plusVertical} />
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              } else if (!isEditMode && item.id === -3) {
                return <View style={[fridgeTileStyles.tile, {opacity: 0}]} />;
              } else {
                return (
                  <FridgeTile
                    fridge={item}
                    isEditMode={isEditMode}
                    onEdit={isEditMode ? handleEditFridge : undefined}
                  />
                );
              }
            }}
          />
        </View>

        {/* Hidden Fridges : Bottem Sheet */}
        {isEditMode && (
          <Animated.View
            style={[styles.bottomSheet, {height: bottomSheetHeight}]}>
            {/* Header : Drag Handle */}
            <TouchableOpacity
              style={styles.bottomSheetHeader}
              onPress={toggleBottomSheet}>
              <View style={styles.dragHandle} />
              <CustomText style={styles.bottomSheetTitle}>
                숨긴 냉장고{' '}
                {getHiddenFridgeTiles().filter(f => f.id > 0).length}개
              </CustomText>
            </TouchableOpacity>

            {/* Hidden Fridge List */}
            {isBottomSheetExpanded && (
              <View style={styles.bottomSheetContent}>
                <FlatList
                  data={getHiddenFridgeTiles()}
                  keyExtractor={item => item.id.toString()}
                  numColumns={2}
                  columnWrapperStyle={{justifyContent: 'space-between'}}
                  contentContainerStyle={styles.list}
                  renderItem={({item}) => {
                    if (item.id === -4) {
                      return (
                        <View style={[fridgeTileStyles.tile, {opacity: 0}]} />
                      );
                    } else {
                      return (
                        <FridgeTile
                          fridge={item}
                          isEditMode={isEditMode}
                          isHidden={true}
                          onEdit={handleEditFridge}
                        />
                      );
                    }
                  }}
                />
              </View>
            )}
          </Animated.View>
        )}

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
