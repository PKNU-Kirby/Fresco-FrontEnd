import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import CustomText from '../../common/CustomText';
import BackButton from '../../common/BackButton';
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
      <BackButton onPress={onBackPress} />

      <CustomText style={styles.headerTitle}>{fridgeName}</CustomText>

      <TouchableOpacity onPress={onAccountPress} style={styles.accountButton}>
        <CustomText style={styles.headerSettingsButtonText}>≡</CustomText>
      </TouchableOpacity>
    </View>
  );
};

export default FridgeHeader;
