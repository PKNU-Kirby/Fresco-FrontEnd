import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import CustomText from '../../common/CustomText';
import {styles} from './styles';

type FridgeHeaderProps = {
  fridgeName: string;
  onBackPress: () => void;
  onAccountPress: () => void;
};

const FridgeHeader: React.FC<FridgeHeaderProps> = ({
  fridgeName,
  onBackPress,
  onAccountPress,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <CustomText style={styles.headerBackButtonText}>뒤로가기</CustomText>
      </TouchableOpacity>

      <CustomText style={styles.headerTitle}>{fridgeName}</CustomText>

      <TouchableOpacity onPress={onAccountPress} style={styles.accountButton}>
        <CustomText style={styles.headerSettingsButtonText}>≡</CustomText>
      </TouchableOpacity>
    </View>
  );
};

export default FridgeHeader;
