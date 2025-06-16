import React from 'react';
import {SafeAreaView} from 'react-native';
import styles from './App.styles';

import LoginScreen from './src/screens/LoginScreen';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <LoginScreen />
    </SafeAreaView>
  );
}
export default App;
