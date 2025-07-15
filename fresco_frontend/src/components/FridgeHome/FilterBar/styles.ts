import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 56,
  },
  leftTabGroup: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  rightTabGroup: {
    flexDirection: 'row',
    gap: 8,
  },
});
