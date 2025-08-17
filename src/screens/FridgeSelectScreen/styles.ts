import { StyleSheet } from 'react-native';

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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftHeader: {
    width: 76,
    alignItems: 'flex-start',
  },
  centerHeader: {
    flex: 1,
    alignItems: 'center',
  },
  rightHeader: {
    flexDirection: 'row',
    width: 76,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#444',
  },
  userName: {
    fontWeight: '800',
    color: '#25A325',
  },
  editButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    padding: 8,
    backgroundColor: 'lightgray',
    borderRadius: 8,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    padding: 8,
    backgroundColor: 'lightgray',
    borderRadius: 8,
    marginLeft: 28,
  },

  /** List Style */
  fridgeTilesListContainer: {
    flex: 1,
    marginTop: 24,
  },
  list: {
    marginHorizontal: 8,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 16,
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
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetHeader: {
    height: 72,
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
    marginTop: 16,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  bottomSheetContent: {
    flex: 1,
    padding: 16,
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
    width: 168,
    height: 168,
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  smallTile: {
    width: 70,
    height: 70,
    borderRadius: 12,
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
    fontSize: 18,
    fontWeight: '700',
  },
  smallTileText: {
    fontSize: 16,
    fontWeight: '600',
  },

  /** Add Button Style */
  // Plus Icon

  /** 숨김 상태 표시 (좌하단) */
  hiddenIndicator: {
    position: 'absolute',
    bottom: -5,
    left: -5,
    backgroundColor: '#333',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /** Fridge Name Styles */
  fridgeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 100,
    lineHeight: 16,
  },
  smallFridgeName: {
    fontSize: 12,
    maxWidth: 70,
  },
  hiddenFridgeName: {
    marginTop: 12,
    marginBottom: 16,
    color: '#999',
  },
  editFridgeName: {},

  /** Quick Actions Buttons */
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
    gap: 8,
    position: 'absolute',
    top: 60,
    right: 22,
  },
  quickActionButton: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.8,
    shadowRadius: 3.84,
    elevation: 50,
  },

  /** Plus 타일 */
  plusTile: {
    width: 168,
    height: 168,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  plusButton: {
    width: 80,
    height: 80,
    backgroundColor: '#9c9c9cff',
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    position: 'relative',
  },

  editModeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '500',
  },

  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },

  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },

  memberCount: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },

  dateText: {
    fontSize: 10,
    color: '#adb5bd',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },

  hiddenIndicatorText: {
    fontSize: 9,
    color: '#212529',
    fontWeight: '600',
  },

  quickActionText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '500',
  },

  // additional style
  // 개별 편집 모드 표시
  editModeIndicator: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 드래그 오버 상태
  dragOverContainer: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
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
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
});
