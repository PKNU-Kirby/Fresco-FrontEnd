import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  backButton: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  // 비활성화 상태 스타일
  backButtonDisabled: {
    opacity: 0.5,
  },
});
