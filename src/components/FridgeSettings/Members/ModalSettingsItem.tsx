import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { modalSettingsItemStyles as styles } from './styles';

interface ModalSettingsItemProps {
  icon: string;
  title: string;
  isLast?: boolean;
  iconColor: string;
  onPress: () => void;
}

const ModalSettingsItem: React.FC<ModalSettingsItemProps> = ({
  icon,
  title,
  iconColor,
  isLast = false,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.settingsItem, isLast && styles.settingsItemLast]}
    onPress={onPress}
  >
    <View style={styles.settingsItemLeft}>
      <View style={[styles.settingsItemIcon, { backgroundColor: iconColor }]}>
        <Ionicons name={icon} size={20} color="#f8f8f8" />
      </View>
      <View style={styles.settingsItemContent}>
        <Text style={styles.settingsItemTitle}>{title}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default ModalSettingsItem;
