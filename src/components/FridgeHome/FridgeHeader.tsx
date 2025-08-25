import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BackButton from '../_common/BackButton';
import { fridgeHeaderStyles as styles } from './styles';

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
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {fridgeName}
        </Text>
      </View>

      {/* Right : Setting button */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          onPress={onSettingsPress}
          style={styles.settingsButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="menu" size={28} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FridgeHeader;
