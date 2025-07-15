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
      {/* LEFT : Back button */}
      <View style={styles.leftSection}>
        <BackButton onPress={onBackPress} />
      </View>

      {/* MID : Fridge name */}
      <View style={styles.centerSection}>
        <CustomText
          style={styles.headerTitle}
          numberOfLines={1}
          ellipsizeMode="tail">
          {fridgeName}
        </CustomText>
      </View>

      {/* Right : Setting button */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          onPress={onSettingsPress}
          style={styles.settingsButton}
          activeOpacity={0.7}>
          <MaterialIcons name="menu" size={28} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FridgeHeader;
