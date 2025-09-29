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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
  },
  headerRight: {
    width: 40,
  },

  // 콘텐츠 영역
  content: {
    flex: 1,
    paddingTop: 8,
  },

  // 로딩 상태
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },

  // iOS 스타일 설정 컨테이너
  settingsContainer: {
    flex: 1,
    marginHorizontal: 0,
  },

  // 냉장고 정보 섹션 스타일
  settingsGroup: {
    backgroundColor: '#fff',
    marginHorizontal: scale(22),
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
    fontSize: scale(18),
    fontWeight: '800',
    color: 'rgba(51, 61, 75, 1)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
    minHeight: 44,
  },

  settingsItemLast: {
    borderBottomWidth: 0,
  },

  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  settingsItemIcon: {
    marginRight: 12,
    width: 28,
    alignItems: 'center',
  },

  settingsItemContent: {
    flex: 1,
  },

  settingsItemTitle: {
    fontSize: 17, // iOS 스타일 크기
    fontWeight: '400',
    color: '#000000', // iOS 스타일 검은색
    marginBottom: 2,
  },

  settingsItemSubtitle: {
    fontSize: 15, // iOS 스타일 크기
    color: '#6D6D72', // iOS 스타일 회색
    lineHeight: 18,
  },

  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  settingsItemValue: {
    fontSize: 17,
    color: '#6D6D72', // iOS 스타일 회색
    marginRight: 8,
  },

  settingsItemArrow: {
    marginLeft: 4,
  },

  // 위험한 액션용 스타일
  dangerItem: {
    color: '#FF3B30', // iOS 스타일 빨간색
  },

  // 스위치가 있는 아이템
  switchItem: {
    paddingRight: 16,
  },

  // 섹션 스타일 (설명문 등)
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 8,
  },

  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },

  // 일수 선택 옵션 (태그 스타일)
  dayOptionsContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    paddingTop: 12,
  },
  dayOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  dayOptionSelected: {
    backgroundColor: '#60A5FA',
    borderColor: '#60A5FA',
  },
  dayOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  dayOptionTextSelected: {
    color: '#FFFFFF',
  },

  // 시간 선택기
  timeSelector: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 16,
    color: '#2D2D2D',
    flex: 1,
    marginLeft: 12,
    fontWeight: '500',
  },

  // 멤버 카드 (기존 스타일 개선)
  membersSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  memberCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  memberCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberAvatar: {
    marginRight: 12,
  },
  memberMainInfo: {
    flex: 1,
  },
  memberNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  ownerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  memberCardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  memberJoinDateText: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyMembers: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalButtons: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#60A5FA',
    fontWeight: '600',
  },

  // 초대 모달 전용 스타일
  inviteSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  fridgeNameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  fridgeSubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  codeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  codeTextContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  codeText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  copyButton: {
    backgroundColor: '#60A5FA',
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  regenerateButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  regenerateButtonText: {
    fontSize: 14,
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
    paddingHorizontal: 8,
    paddingTop: 10,
  },

  // 테스트 버튼
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#60A5FA',
    marginBottom: 8,
  },
  testButtonText: {
    fontSize: 14,
    color: '#60A5FA',
    fontWeight: '600',
  },
  testDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});
