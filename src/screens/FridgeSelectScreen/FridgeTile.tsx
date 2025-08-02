import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomText from '../../components/common/CustomText';
import { fridgeTileStyles as styles } from './styles';

// types
type RootStackParamList = {
  MainTabs: { fridgeId: number; fridgeName: string };
};
type Fridge = {
  id: number;
  name: string;
  isHidden: boolean;
};
interface FridgeTileProps {
  fridge: Fridge;
  isEditMode: boolean;
  onEdit?: (fridge: Fridge) => void;
  isHidden?: boolean;
  isSmall?: boolean;
}

const FridgeTile: React.FC<FridgeTileProps> = ({
  fridge,
  isEditMode,
  onEdit,
  isHidden,
  isSmall,
}) => {
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

  // style logic
  const tileStyle = [
    isSmall ? styles.smallTile : styles.tile,
    isHidden && styles.hiddenTile,
  ].filter(Boolean);

  const textStyle = isSmall ? styles.smallTileText : styles.tileText;

  const accessibilityLabel = `${fridge.name} 냉장고${
    isHidden ? ' (숨김)' : ''
  }`;
  const accessibilityState = {
    disabled: isHidden,
    selected: isEditMode,
  };

  return (
    <TouchableOpacity
      style={tileStyle}
      onPress={handlePress}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      activeOpacity={0.7}
    >
      <CustomText style={textStyle}>{fridge.name}</CustomText>
    </TouchableOpacity>
  );
};

export default FridgeTile;
