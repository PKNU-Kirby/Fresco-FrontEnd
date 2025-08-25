import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
// const baseHeight = 874;

// 반응형 함수
// const wp = (percentage: number) => (width * percentage) / 100;
// const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

const styles = StyleSheet.create({
  loginButton: {
    width: '100%',
  },
  loadingLoginButton: {
    width: '100%',
    opacity: 0.7,
  },
  image: {
    width: '100%',
    height: scale(53),
    resizeMode: 'contain',
  },
});

export default styles;
