import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity, SafeAreaView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../App';

import CustomText from '../../components/common/CustomText';
import FridgeTile from '../../components/Fridge/FridgeTile';
import FridgeModalForm from '../../components/Fridge/FridgeModalForm';

import styles from './styles';

interface FridgeSection {
  id: string;
  name: string;
}

interface Fridge {
  id: string;
  name: string;
  sections: FridgeSection[];
}

const FridgeSelectScreen = (): React.JSX.Element => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [fridges, setFridges] = useState<Fridge[]>([
    {
      id: '1',
      name: '메인 냉장고',
      sections: [
        {id: '1-1', name: '본가'},
        {id: '1-2', name: '자취방'},
      ],
    },
  ]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingFridge, setEditingFridge] = useState<Fridge | null>(null);
  const [newFridgeName, setNewFridgeName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(setUserId);
  }, []);

  // LOG-OUT : back to Login Screen
  const handleLogOut = () => {
    AsyncStorage.removeItem('userId').then(() => {
      navigation.reset({index: 0, routes: [{name: 'Login'}]});
    });
  };

  // EDIT-BUTTON : '편집하기 <-> 편집 완료'
  const toggleEditMode = () => setIsEditMode(prev => !prev);

  // ADD-FRIDGE : 냉장고 추가
  const handleAddFridge = () => {
    if (!newFridgeName.trim()) {
      return;
    }

    const timestamp = Date.now().toString();
    const newFridge: Fridge = {
      id: timestamp,
      name: newFridgeName.trim(),
      sections: [
        {id: `${timestamp}-1`, name: '본가'},
        {id: `${timestamp}-2`, name: '자취방'},
      ],
    };
    setFridges(prev => [...prev, newFridge]);
    setNewFridgeName('');
    setIsAddModalVisible(false);
  };

  // EDIT-FRIDGE : 냉장고 편집 (이름 변경, 삭제)
  const handleEditFridge = (fridge: Fridge) => {
    setEditingFridge(fridge);
    setNewFridgeName(fridge.name);
    setIsEditModalVisible(true);
  };

  // UPDATE-FRIDGE-STATE
  const handleUpdateFridge = () => {
    if (!newFridgeName.trim() || !editingFridge) {
      return;
    }
    setFridges(prev =>
      prev.map(fridge =>
        fridge.id === editingFridge.id
          ? {...fridge, name: newFridgeName.trim()}
          : fridge,
      ),
    );
    setNewFridgeName('');
    setEditingFridge(null);
    setIsEditModalVisible(false);
  };

  // SELECTED-FRIDGE : move to Selected Fridge Screen
  const handleSelectFridge = (fridgeId: string) => {
    console.log('선택된 냉장고:', fridgeId);
    // navigation.navigate('FridgeContent', { fridgeId });
  };

  const fridgeData = [...fridges, {id: 'add', name: '+', sections: []}];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleEditMode}>
          <CustomText style={styles.editModeButton}>
            {isEditMode ? 'Done' : 'Edit'}
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogOut}>
          <CustomText style={styles.logoutText}>Sign Out</CustomText>
        </TouchableOpacity>
      </View>

      <View style={styles.tilesContainer}>
        {fridgeData.map(fridge => (
          <FridgeTile
            key={fridge.id}
            fridge={fridge}
            isEditMode={isEditMode}
            onSelect={handleSelectFridge}
            onEdit={handleEditFridge}
            onAdd={() => setIsAddModalVisible(true)}
          />
        ))}
      </View>

      <FridgeModalForm
        visible={isAddModalVisible}
        title="새 냉장고 추가"
        placeholder="냉장고 이름"
        value={newFridgeName}
        onChangeText={setNewFridgeName}
        onCancel={() => {
          setIsAddModalVisible(false);
          setNewFridgeName('');
        }}
        onSubmit={handleAddFridge}
      />

      <FridgeModalForm
        visible={isEditModalVisible}
        title="냉장고 이름 수정"
        placeholder="냉장고 이름"
        value={newFridgeName}
        onChangeText={setNewFridgeName}
        onCancel={() => {
          setIsEditModalVisible(false);
          setNewFridgeName('');
          setEditingFridge(null);
        }}
        onSubmit={handleUpdateFridge}
      />
    </SafeAreaView>
  );
};

export default FridgeSelectScreen;
