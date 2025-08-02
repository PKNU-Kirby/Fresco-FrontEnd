import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  /** Fridge Select Screen Style */
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /** Edit Button Style */
  editButton: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 8,
    backgroundColor: 'lightgray',
    borderRadius: 8,
  },

  list: { gap: 5, marginHorizontal: 10 },

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
    shadowOffset: { width: 0, height: -5 },
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

export const fridgeTileStyles = StyleSheet.create({
  /** Fridge Tile Style */
  tile: {
    flex: 1,
    aspectRatio: 1,
    margin: 10,
    backgroundColor: 'lightgray',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tileText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  /** Add Button Style */
  plusTile: {
    flex: 1,
    aspectRatio: 1,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButton: {
    width: 80,
    height: 80,
    backgroundColor: 'lightgray',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Plus Icon
  plusIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  plusHorizontal: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: 'black',
    top: 9,
    left: 0,
  },
  plusVertical: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: 'black',
    top: 0,
    left: 9,
  },

  /** Hidden Fridge Tile Style */
  hiddenTile: {
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: '#bbb',
    borderStyle: 'dashed',
    opacity: 0.7,
  },
  smallTile: {
    width: 60,
    height: 60,
    margin: 5,
    backgroundColor: 'lightgray',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  smallTileText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
