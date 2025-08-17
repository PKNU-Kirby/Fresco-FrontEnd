import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import CustomText from '../../components/common/CustomText';
import BackButton from '../../components/common/BackButton';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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
          ellipsizeMode="tail"
        >
          {fridgeName}
        </CustomText>
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftSection: {
    width: 56,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rightSection: {
    width: 56,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    maxWidth: '100%',
  },
  settingsButton: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});
