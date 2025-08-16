import { StyleSheet } from 'react-native';

export const loginButtonStyle = StyleSheet.create({
  loginButton: {
    width: '100%',
  },
  image: {
    width: '100%',
    height: 53,
    resizeMode: 'contain',
  },
});

const styles = StyleSheet.create({
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
    marginTop: 72,
  },
  headerText: {
    fontSize: 36,
    color: '#444',
    fontWeight: '800',
    textAlign: 'center',
  },
  buttonWrapper: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  loginButton: {
    width: '100%',
  },
  image: {
    width: '100%',
    height: 53,
    resizeMode: 'contain',
  },
});

export default styles;
