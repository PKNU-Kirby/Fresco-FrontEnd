import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import CustomText from '../../common/CustomText';
import BackButton from '../../common/BackButton';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {styles} from './styles';

type FridgeHeaderProps = {
  fridgeName: string;
  onBackPress: () => void;
  onSettingsPress: () => void;
};

const FridgeHeader: React.FC<FridgeHeaderProps> = ({
  fridgeName,
  onBackPress,
  onSettingsPress,
}) => {
  return (
    <View style={styles.header}>
      <BackButton onPress={onBackPress} />

      <CustomText style={styles.headerTitle}>{fridgeName}</CustomText>

      <TouchableOpacity onPress={onSettingsPress} style={styles.settingsButton}>
        <MaterialIcons name="menu" size={28} color="#333" />
      </TouchableOpacity>
    </View>
  );
};

export default FridgeHeader;
