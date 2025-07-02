import {StyleSheet, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');
const tileSize = (width - 60) / 2; // 좌우 패딩 20씩, 가운데 간격 20

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editModeButton: {
    color: '#007bff',
    fontSize: 14,
  },
  logoutText: {
    color: '#ff0000',
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'space-between',
  },
  fridgeTile: {
    width: tileSize,
    height: tileSize,
    backgroundColor: '#cccccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  addTile: {
    backgroundColor: '#cccccc',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#999999',
  },
  tileText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  addTileText: {
    fontSize: 32,
    color: '#666666',
  },
  editIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  editIconText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: '#cccccc',
    width: '80%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#cccccc',
    minWidth: 80,
    alignItems: 'center',
  },
});

export default styles;
