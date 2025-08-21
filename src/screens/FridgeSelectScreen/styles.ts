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

export const fridgeTileStyles = StyleSheet.create({
  /** CONTAINER ********************************************************************/
  tileContainer: {
    alignItems: 'center',
  },
  hiddenContainer: {
    opacity: 0.6,
  },
  editModeContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },

  /** TILES *************************************************************************/
  tile: {
    flexDirection: 'row',
    width: scale(168),
    height: scale(168),
    backgroundColor: 'white',
    borderRadius: scale(16),
    marginHorizontal: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(3.84),
    elevation: 3,
  },
  smallTile: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(12),
  },
  hiddenTile: {
    backgroundColor: '#9c9c9cff',
  },
  editModeTile: {
    backgroundColor: '#9c9c9cff',
  },

  /** 아이콘 컨테이너 */
  iconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tileText: {
    fontSize: scale(18),
    fontWeight: '700',
  },
  smallTileText: {
    fontSize: scale(16),
    fontWeight: '600',
  },

  /** Add Button Style */
  // Plus Icon

  /** 숨김 상태 표시 (좌하단) */
  hiddenIndicator: {
    position: 'absolute',
    bottom: scale(-5),
    left: scale(-5),
    backgroundColor: '#333',
    paddingHorizontal: scale(4),
    paddingVertical: scale(2),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },

  /** Fridge Name Styles */
  fridgeName: {
    fontSize: scale(16),
    fontWeight: '700',
    color: '#444',
    textAlign: 'center',
    marginTop: scale(12),
    maxWidth: scale(100),
    lineHeight: scale(16),
  },
  smallFridgeName: {
    fontSize: scale(12),
    maxWidth: scale(70),
  },
  hiddenFridgeName: {
    marginTop: scale(12),
    marginBottom: scale(16),
    color: '#999',
  },
  editFridgeName: {},

  /** Quick Actions Buttons */
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: scale(6),
    gap: scale(8),
    position: 'absolute',
    top: scale(60),
    right: scale(22),
  },
  quickActionButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOffset: {
      width: scale(3),
      height: scale(3),
    },
    shadowOpacity: 0.8,
    shadowRadius: scale(3.84),
    elevation: 50,
  },

  /** Plus 타일 */
  plusTile: {
    width: scale(168),
    height: scale(168),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: scale(8),
  },
  plusButton: {
    width: scale(80),
    height: scale(80),
    backgroundColor: '#9c9c9cff',
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    position: 'relative',
  },

  editModeText: {
    fontSize: scale(10),
    color: '#ffffff',
    fontWeight: '500',
  },

  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
    paddingHorizontal: scale(8),
  },

  roleBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: scale(12),
    alignSelf: 'flex-start',
  },

  roleBadgeText: {
    fontSize: scale(11),
    fontWeight: '600',
    color: '#ffffff',
  },

  memberCount: {
    fontSize: scale(12),
    color: '#6c757d',
    fontWeight: '500',
  },

  dateText: {
    fontSize: scale(10),
    color: '#adb5bd',
    textAlign: 'center',
    marginBottom: scale(8),
    paddingHorizontal: scale(8),
  },

  hiddenIndicatorText: {
    fontSize: scale(9),
    color: '#212529',
    fontWeight: '600',
  },

  quickActionText: {
    fontSize: scale(10),
    color: '#ffffff',
    fontWeight: '500',
  },

  // additional style
  // 개별 편집 모드 표시
  editModeIndicator: {
    position: 'absolute',
    top: scale(5),
    left: scale(5),
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 드래그 오버 상태
  dragOverContainer: {
    backgroundColor: '#e3f2fd',
    borderWidth: scale(2),
    borderColor: '#2196f3',
    borderStyle: 'dashed',
  },

  // 드래그 중 스타일
  draggingTile: {
    opacity: 0.8,
    transform: [{ scale: 1.1 }],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 10,
  },
});
