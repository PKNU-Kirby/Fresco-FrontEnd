import React from 'react';
import {TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import CustomText from '../common/CustomText';
import styles from './FridgeTileStyles';
import {RootStackParamList} from '../../../App';

export type Fridge = {
  id: number;
  name: string;
  isHidden: boolean;
};

type Props = {
  fridge: Fridge;
  isEditMode: boolean;
};

const FridgeTile = ({fridge}: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <TouchableOpacity
      style={styles.tile}
      onPress={() =>
        navigation.navigate('FridgeHome', {
          fridgeId: fridge.id,
          fridgeName: fridge.name,
        })
      }>
      <CustomText style={styles.tileText}>{fridge.name}</CustomText>
    </TouchableOpacity>
  );
};

export default FridgeTile;
