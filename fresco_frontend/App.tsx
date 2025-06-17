import React from 'react';
import {SafeAreaView} from 'react-native';
import styles from './App.styles';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import FridgeSelectScreen from './src/screens/FridgeSelectScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  FridgeSelect: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="FridgeSelect" component={FridgeSelectScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default App;
