import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
  },
  backButton: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 8,
    backgroundColor: 'lightgray',
    borderRadius: 8,
  },
  accountButton: {
    padding: 8,
    minWidth: 60,
    alignItems: 'flex-end',
  },
  headerButtonText: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
});
