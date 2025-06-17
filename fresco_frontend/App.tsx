import React from 'react';
import {SafeAreaView} from 'react-native';
import styles from './App.styles';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import FridgeSelectScreen from './src/screens/FridgeSelectScreen';

export type RootStackParamList = {
  Login: undefined;
  FridgeSelect: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="FridgeSelect" component={FridgeSelectScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default App;
