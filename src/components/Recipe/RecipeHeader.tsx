import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RecipeStackParamList } from '../../screens/RecipeScreen/RecipeNavigator';
import { recipeHeaderStyles as styles } from './styles';

type RecipeHeaderNavigationProp =
  NativeStackNavigationProp<RecipeStackParamList>;

const RecipeHeader: React.FC = () => {
  const navigation = useNavigation<RecipeHeaderNavigationProp>();

  const openSearchPage = () => {
    navigation.navigate('Search');
  };

  return (
    <View style={styles.header}>
      {/* Left Section - Back Button */}
      <View style={styles.leftSection}>
        <></>
      </View>

      {/* Center Section - Title */}
      <View style={styles.centerSection}>
        <Text style={styles.headerTitle}>레시피 목록</Text>
      </View>

      {/* Right Section - Search Icon */}
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.searchButton} onPress={openSearchPage}>
          <Icon name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RecipeHeader;
