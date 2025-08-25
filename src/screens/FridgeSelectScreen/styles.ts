import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
// const baseHeight = 874;

// 반응형 함수
// const wp = (percentage: number) => (width * percentage) / 100;
// const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

export const styles = StyleSheet.create({
  /** Fridge Select Screen Style */
  container: {
    flex: 1,
    backgroundColor: '#e8f5e8',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /** Header Style */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: scale(16),
    paddingTop: scale(8),
    paddingBottom: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(5),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(3.84),
    elevation: scale(5),
  },
  leftHeader: {
    width: scale(76),
    alignItems: 'flex-start',
  },
  centerHeader: {
    flex: 1,
    alignItems: 'center',
  },
  rightHeader: {
    flexDirection: 'row',
    width: scale(76),
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: scale(20),
    fontWeight: '600',
    color: '#444',
  },
  userName: {
    fontWeight: '800',
    color: '#25A325',
  },
  editButton: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#444',
    padding: scale(8),
    backgroundColor: 'lightgray',
    borderRadius: scale(8),
  },
  saveButton: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#444',
    padding: scale(8),
    backgroundColor: 'lightgray',
    borderRadius: scale(8),
    marginLeft: scale(28),
  },

  /** List Style */
  fridgeTilesListContainer: {
    flex: 1,
    marginTop: scale(24),
  },
  list: {
    marginHorizontal: scale(8),
    gap: scale(16),
    justifyContent: 'center',
    paddingHorizontal: scale(16),
  },

  /** Bottom Sheet Style : Hidden Fridge Section */
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'lightgray',
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    borderTopWidth: scale(1),
    borderTopColor: '#e0e0e0',
    // Shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(-5) },
    shadowOpacity: 0.25,
    shadowRadius: scale(4),
    elevation: 5,
  },
  bottomSheetHeader: {
    height: scale(72),
    paddingBottom: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    backgroundColor: 'lightgray',
  },
  dragHandle: {
    width: scale(140),
    height: scale(4),
    backgroundColor: 'darkgray',
    borderRadius: scale(2),
    marginBottom: scale(16),
    marginTop: scale(16),
  },
  bottomSheetTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#666',
  },
  bottomSheetContent: {
    flex: 1,
    padding: scale(16),
  },
});
