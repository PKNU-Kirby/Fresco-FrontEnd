import {StyleSheet} from 'react-native';

const fridgeTileStyles = StyleSheet.create({
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
    shadowOffset: {width: 0, height: 4},
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  smallTileText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default fridgeTileStyles;
