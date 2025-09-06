import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../screens/FridgeSettingsScreen/styles';

interface SettingsItemProps {
  title: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  isDanger?: boolean;
  rightComponent?: React.ReactNode;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  value,
  onPress,
  showArrow = true,
  isDanger = false,
  rightComponent,
}) => (
  <TouchableOpacity
    style={[styles.settingsItem]}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.settingsItemLeft}>
      <View style={styles.settingsItemContent}>
        <Text style={[styles.settingsItemTitle, isDanger && styles.dangerItem]}>
          {title}
        </Text>
      </View>
    </View>
    <View style={styles.settingsItemRight}>
      {value && <Text style={styles.settingsItemValue}>{value}</Text>}
      {rightComponent}
      {showArrow && onPress && (
        <View style={styles.settingsItemArrow}>
          <Ionicons name="chevron-forward" size={18} color="#C4C4C4" />
        </View>
      )}
    </View>
  </TouchableOpacity>
);

export default SettingsItem;
