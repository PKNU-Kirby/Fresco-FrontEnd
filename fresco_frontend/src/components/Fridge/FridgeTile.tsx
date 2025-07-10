import React from 'react';
import {TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import CustomText from '../common/CustomText';
import {RootStackParamList} from '../../../App';
import styles from './FridgeTileStyles';

type Fridge = {
  id: number;
  name: string;
  isHidden: boolean;
};

type Props = {
  fridge: Fridge;
  isEditMode: boolean;
  onEdit?: (fridge: Fridge) => void;
  isHidden?: boolean;
  isSmall?: boolean;
};

const FridgeTile = ({fridge, isEditMode, onEdit, isHidden, isSmall}: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = () => {
    if (isEditMode && onEdit) {
      // Call Edit Func
      onEdit(fridge);
    } else if (!isEditMode) {
      // Navigate to Fridge Home
      navigation.navigate('MainTabs', {
        fridgeId: fridge.id,
        fridgeName: fridge.name,
      });
    }
  };

  const getTileStyle = () => {
    if (isSmall) {
      return isHidden
        ? [styles.smallTile, styles.hiddenTile]
        : styles.smallTile;
    } else {
      return isHidden ? [styles.tile, styles.hiddenTile] : styles.tile;
    }
  };

  const getTextStyle = () => {
    return isSmall ? styles.smallTileText : styles.tileText;
  };

  return (
    <TouchableOpacity style={getTileStyle()} onPress={handlePress}>
      <CustomText style={getTextStyle()}>{fridge.name}</CustomText>
    </TouchableOpacity>
  );
};

export default FridgeTile;
