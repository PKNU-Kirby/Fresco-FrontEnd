import {StyleSheet} from 'react-native';

const fridgeTileStyles = StyleSheet.create({
  tile: {
    flex: 1,
    aspectRatio: 1,
    margin: 10,
    backgroundColor: 'lightgray',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',

    // 그림자 : iOS
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,

    // 그림자 : Android
    // elevation: 4,
  },
  tileText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default fridgeTileStyles;
