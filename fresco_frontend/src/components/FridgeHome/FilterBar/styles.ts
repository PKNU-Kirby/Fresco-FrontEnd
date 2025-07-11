import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  leftTabGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  rightTabGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 16,
    minWidth: 80,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'lightgray',
    borderRadius: 15,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  actionButtonActive: {
    backgroundColor: '#333',
  },
  actionButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
