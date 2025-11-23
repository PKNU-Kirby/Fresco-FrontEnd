import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
//const baseHeight = 874;

// 반응형 함수
//const wp = (percentage: number) => (width * percentage) / 100;
//const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  // Setting Screen Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#F2F2F7',
    borderBottomWidth: scale(0),
  },
  headerTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#444',
  },
  headerRight: {
    width: scale(40),
  },

  // 콘텐츠 영역
  content: {
    flex: 1,
    paddingTop: scale(8),
  },

  // 로딩 상태
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: scale(12),
    fontSize: scale(16),
    color: '#6B7280',
  },

  // iOS 스타일 설정 컨테이너
  settingsContainer: {
    flex: 1,
    marginHorizontal: scale(0),
  },

  // 냉장고 정보 섹션 스타일
  settingsGroup: {
    backgroundColor: '#fff',
    marginHorizontal: scale(16),
    marginBottom: scale(12),
    borderRadius: scale(20),
    paddingBottom: scale(8),
  },
  groupHeader: {
    paddingHorizontal: scale(24),
    paddingBottom: scale(12),
    paddingTop: scale(28),
  },
  groupTitle: {
    fontSize: scale(19),
    fontWeight: '800',
    color: 'rgba(51, 61, 75, 1)',
    textTransform: 'uppercase',
    letterSpacing: scale(0.5),
  },

  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: scale(0.5),
    borderBottomColor: '#C6C6C8',
    minHeight: scale(44),
  },

  settingsItemLast: {
    borderBottomWidth: scale(0),
  },

  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  settingsItemIcon: {
    marginRight: scale(12),
    width: scale(28),
    alignItems: 'center',
  },

  settingsItemContent: {
    flex: 1,
  },

  settingsItemTitle: {
    fontSize: scale(17), // iOS 스타일 크기
    fontWeight: '400',
    color: '#000000', // iOS 스타일 검은색
    marginBottom: scale(2),
  },

  settingsItemSubtitle: {
    fontSize: scale(15), // iOS 스타일 크기
    color: '#6D6D72', // iOS 스타일 회색
    lineHeight: scale(18),
  },

  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  settingsItemValue: {
    fontSize: scale(17),
    color: '#6D6D72', // iOS 스타일 회색
    marginRight: scale(8),
  },

  settingsItemArrow: {
    marginLeft: scale(4),
  },

  // 위험한 액션용 스타일
  dangerItem: {
    color: '#FF3B30', // iOS 스타일 빨간색
  },

  // 스위치가 있는 아이템
  switchItem: {
    paddingRight: scale(16),
  },

  // 섹션 스타일 (설명문 등)
  section: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
  },

  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: scale(8),
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

  // 시간 선택기
  timeSelector: {
    backgroundColor: '#F9FAFB',
    borderRadius: scale(12),
    padding: scale(16),
    borderWidth: scale(1),
    borderColor: '#E5E7EB',
  },
  timeSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: scale(16),
    color: '#2D2D2D',
    flex: scale(1),
    marginLeft: scale(12),
    fontWeight: '500',
  },

  // 멤버 카드 (기존 스타일 개선)
  membersSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: scale(16),
    marginBottom: scale(12),
    borderRadius: scale(16),
    padding: scale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: scale(1),
    },
    shadowOpacity: 0.05,
    shadowRadius: scale(3),
    elevation: 1,
  },
  memberCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: scale(12),
    borderWidth: scale(1),
    borderColor: '#E5E7EB',
  },
  memberCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  memberAvatar: {
    marginRight: scale(12),
  },
  memberMainInfo: {
    flex: 1,
  },
  memberNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  memberName: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#2D2D2D',
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: '#FEF3C7',
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: scale(12),
  },
  ownerBadgeText: {
    fontSize: scale(12),
    fontWeight: '600',
    color: '#92400E',
  },
  memberCardFooter: {
    borderTopWidth: scale(1),
    borderTopColor: '#E5E7EB',
    paddingTop: scale(8),
  },
  memberJoinDateText: {
    fontSize: scale(13),
    color: '#6B7280',
  },
  emptyMembers: {
    alignItems: 'center',
    paddingVertical: scale(20),
  },
  emptyText: {
    fontSize: scale(14),
    color: '#6B7280',
  },

  // 모달 스타일
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
  closeButtonText: {
    fontSize: scale(16),
    color: '#6B7280',
    fontWeight: '600',
  },
  modalButtons: {
    borderTopWidth: scale(1),
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: scale(16),
    alignItems: 'center',
    borderRightWidth: scale(1),
    borderRightColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: scale(16),
    color: '#6B7280',
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: scale(16),
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: scale(16),
    color: '#60A5FA',
    fontWeight: '600',
  },

  // 초대 모달 전용 스타일
  inviteSection: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(20),
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  fridgeNameText: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  fridgeSubText: {
    fontSize: scale(14),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: scale(20),
  },

  codeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: scale(12),
    borderWidth: scale(1),
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginHorizontal: scale(20),
    marginBottom: scale(12),
  },
  codeTextContainer: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
    justifyContent: 'center',
  },
  codeText: {
    fontSize: scale(14),
    color: '#374151',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  copyButton: {
    backgroundColor: '#60A5FA',
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  regenerateButton: {
    alignItems: 'center',
    paddingVertical: scale(12),
    paddingHorizontal: scale(20),
    marginHorizontal: scale(20),
    marginBottom: scale(8),
    borderRadius: scale(8),
    backgroundColor: '#F3F4F6',
    borderWidth: scale(1),
    borderColor: '#E5E7EB',
  },
  regenerateButtonText: {
    fontSize: scale(14),
    color: '#6B7280',
    fontWeight: '500',
  },

  disabledButton: {
    opacity: 0.5,
  },
  disabledShareButton: {
    opacity: 0.4,
  },

  // DateTimePicker 스타일
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(8),
    paddingTop: scale(10),
  },

  // 테스트 버튼
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    padding: scale(12),
    backgroundColor: '#F0F9FF',
    borderRadius: scale(12),
    borderWidth: scale(1),
    borderColor: '#60A5FA',
    marginBottom: scale(8),
  },
  testButtonText: {
    fontSize: scale(14),
    color: '#60A5FA',
    fontWeight: '600',
  },
  testDescription: {
    fontSize: scale(12),
    color: '#6B7280',
    lineHeight: scale(16),
  },
});

export const settingsItemPropsStyles = StyleSheet.create({
  // Settings Item style
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(24),
    paddingVertical: scale(15),
    backgroundColor: '#fff',
    borderRadius: scale(20),
    paddingRight: scale(20),
  },
  // Left Section
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: scale(17),
    fontWeight: '600',
    color: '#2F4858',
    marginBottom: scale(2),
  },
  dangerItem: {
    color: 'tomato',
  },
  // Right Section
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemValue: {
    fontSize: scale(16),
    color: '#6B7280',
    fontWeight: '700',
    marginRight: scale(8),
  },
  settingsItemArrow: {
    marginLeft: scale(4),
  },
});
