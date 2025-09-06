import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../screens/FridgeSettingsScreen/styles';

interface GroupHeaderProps {
  title: string;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ title }) => (
  <View style={styles.groupHeader}>
    <Text style={styles.groupTitle}>{title}</Text>
  </View>
);

export default GroupHeader;
