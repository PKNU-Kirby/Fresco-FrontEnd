import { StyleSheet } from 'react-native';

// const { width } = Dimensions.get('window');

// iPhone 16 Pro
// const baseWidth = 402;
//const baseHeight = 874;

// 반응형 함수
//const wp = (percentage: number) => (width * percentage) / 100;
//const hp = (percentage: number) => (height * percentage) / 100;
// const scale = (size: number) => (width / baseWidth) * size;

export const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#e8f5e8',
  },
});
