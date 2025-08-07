import React from 'react';
import { View, Text } from 'react-native';
import { headerStyles as styles } from './styles';

interface ShoppingListHeaderProps {
  listName: string;
}

const ShoppingListHeader: React.FC<ShoppingListHeaderProps> = ({
  listName,
}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
        {listName}
      </Text>
    </View>
  );
};

export default ShoppingListHeader;
