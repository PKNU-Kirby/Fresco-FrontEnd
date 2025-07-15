import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  /** Fridge Select Screen Style */
  container: {flex: 1, padding: 16},
  list: {gap: 5, marginHorizontal: 10},
  headerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /** LogOut Button Style */
  logoutButton: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: 'bold',
    padding: 8,
    backgroundColor: 'lightgray',
    borderRadius: 8,
  },
  /** Edit Button Style */
  editButton: {
    fontSize: 16,
    marginHorizontal: 16,
    fontWeight: 'bold',
    padding: 8,
    backgroundColor: 'lightgray',
    borderRadius: 8,
  },

  /** Bottom Sheet Style : Hidden Fridge Section */
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'lightgray',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    // Shadow effect
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -5},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetHeader: {
    height: 80,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'lightgray',
  },
  dragHandle: {
    width: 140,
    height: 4,
    backgroundColor: 'darkgray',
    borderRadius: 2,
    marginBottom: 16,
    marginTop: 8,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default styles;
