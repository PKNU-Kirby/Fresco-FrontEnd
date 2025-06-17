import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const FridgeSelectScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Fridge Select Screen</Text>
    </View>
  );
};

export default FridgeSelectScreen;

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  text: {fontSize: 18},
});
