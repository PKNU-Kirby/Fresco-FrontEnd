import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  list: {gap: 15},
  headerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  logoutButton: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: 'bold',
    padding: 8,
    backgroundColor: 'lightgray',
    borderRadius: 8,
  },
  editButton: {
    marginRight: 16,
    fontSize: 16,
    fontWeight: 'bold',
    padding: 8,
    backgroundColor: 'lightgray',
    borderRadius: 8,
  },
  tileText: {fontSize: 16, fontWeight: 'bold'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});

export default styles;
