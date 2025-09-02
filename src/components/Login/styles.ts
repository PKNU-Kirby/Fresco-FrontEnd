import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
// const baseHeight = 874;

// 반응형 함수
// const wp = (percentage: number) => (width * percentage) / 100;
// const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

export const socialLoginButtonStyles = StyleSheet.create({
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

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e8',
  },
  loginBox: {
    flex: 1,
  },
  header: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scale(72),
  },
  headerText: {
    fontSize: scale(36),
    color: '#444',
    fontWeight: '800',
    textAlign: 'center',
  },
  buttonWrapper: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(24),
  },
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
