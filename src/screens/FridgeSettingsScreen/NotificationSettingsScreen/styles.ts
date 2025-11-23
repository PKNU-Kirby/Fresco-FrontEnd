import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
//const baseHeight = 874;

// 반응형 함수
//const wp = (percentage: number) => (width * percentage) / 100;
//const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(20),
    width: '100%',
    maxWidth: scale(400),
    maxHeight: '80%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: scale(4),
    },
    shadowOpacity: 0.15,
    shadowRadius: scale(10),
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
    borderBottomWidth: scale(1),
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#2D2D2D',
  },
  closeButton: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionDescription: {
    fontSize: scale(14),
    color: '#6B7280',
    lineHeight: scale(20),
    marginBottom: scale(4),
  },

  // 일수 선택 옵션 (태그 스타일)
  dayOptionsContainer: {
    flexDirection: 'row',
    gap: scale(10),
    flexWrap: 'wrap',
    paddingTop: scale(12),
  },
  dayOption: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    borderWidth: scale(1.5),
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  dayOptionSelected: {
    backgroundColor: '#60A5FA',
    borderColor: '#60A5FA',
  },
  dayOptionText: {
    fontSize: scale(14),
    color: '#6B7280',
    fontWeight: '500',
  },
  dayOptionTextSelected: {
    color: '#FFFFFF',
  },

  // 기존 스타일
  container: {
    flex: 1,
    backgroundColor: '#E8F5E8',
  },
  // header style
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: scale(60),
    backgroundColor: '#e8f5e8',
    paddingHorizontal: scale(16),
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8,
    paddingBottom: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: scale(5),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(3.84),
    elevation: 5,
    zIndex: 1001,
  },
  leftSection: {
    width: scale(56),
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scale(8),
  },
  rightSection: {
    width: scale(56),
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    maxWidth: '100%',
  },
  settingsContainer: {
    flex: 1,
    paddingTop: scale(24),
  },
  // Loading style
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: scale(14),
    color: '#6B7280',
  },
  scrollContainer: {
    flex: 1,
  },
  // 섹션 스타일
  notificationSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: scale(16),
    marginTop: scale(16),
    borderRadius: scale(16),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: scale(1),
    },
    shadowOpacity: 0.05,
    shadowRadius: scale(3),
    elevation: 1,
  },
  // 🔥 알림 상태 카드
  notificationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: scale(12),
    padding: scale(16),
    borderWidth: scale(1),
    borderColor: '#E5E7EB',
  },

  notificationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationIconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },

  notificationMainInfo: {
    flex: 1,
  },

  notificationTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: scale(4),
  },

  notificationSubtitle: {
    fontSize: scale(13),
    color: '#6B7280',
  },

  // 설정 카드
  settingCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: scale(12),
    borderWidth: scale(1),
    borderColor: '#E5E7EB',
  },

  settingCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: scale(15),
    fontWeight: '500',
    color: '#2D2D2D',
    marginBottom: scale(4),
  },
  settingSubtitle: {
    fontSize: scale(13),
    color: '#6B7280',
  },
  infoIconContainer: {
    margin: scale(4),
    flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginHorizontal: scale(8),
    marginVertical: scale(8),
  },
  infoTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#444',
    marginLeft: scale(8),
  },

  // 알림 안내 스타일
  infoContainer: {
    borderRadius: scale(8),
    margin: scale(16),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(4),
  },
  infoText: {
    fontSize: scale(15),
    color: '#4B5563',
    lineHeight: scale(20),
    marginLeft: scale(8),
  },
});
