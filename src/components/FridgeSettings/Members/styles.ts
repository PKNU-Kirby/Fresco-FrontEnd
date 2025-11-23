//
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
//const baseHeight = 874;

// 반응형 함수
//const wp = (percentage: number) => (width * percentage) / 100;
//const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

export const inviteMemberModalStyle = StyleSheet.create({
  // Modal
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#fff',
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
    flex: scale(1),
  },
  settingsItemIcon: {
    marginRight: scale(12),
    width: scale(44),
    height: scale(44),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F4858',
    borderRadius: '50%',
  },
  settingsItemContent: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: scale(4),
  },
  settingsItemTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(2),
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(41),
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
  inviteSection: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(32),
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  fridgeNameText: {
    fontSize: scale(20),
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: scale(16),
  },
  fridgeSubText: {
    fontSize: scale(14),
    fontWeight: '700',
    color: '#666',
    textAlign: 'center',
    lineHeight: scale(20),
  },

  settingsGroup: {
    backgroundColor: '#fff',
    marginHorizontal: scale(16),
    marginBottom: scale(12),
    borderRadius: scale(20),
    paddingBottom: scale(8),
  },

  linkContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: scale(10),
    borderWidth: scale(1),
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginHorizontal: scale(12),
    marginBottom: scale(12),
  },
  linkTextContainer: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
    justifyContent: 'center',
  },
  linkText: {
    fontSize: scale(14),
    color: '#374151',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  copyButton: {
    backgroundColor: '#2F4858',
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: scale(16),
    fontWeight: '700',
    color: '#f8f8f8',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledShareButton: {
    opacity: 0.4,
  },

  groupHeader: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(12),
    paddingTop: scale(16),
  },
  groupTitle: {
    fontSize: scale(16),
    fontWeight: '800',
    color: '#444',
    textTransform: 'uppercase',
    letterSpacing: scale(0.5),
  },

  // close Button
  closeButton: {
    borderRadius: scale(16),
    backgroundColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: '0%',
    borderTopLeftRadius: '0%',
  },
  closeButtonText: {
    paddingVertical: scale(20),
    fontSize: scale(16),
    color: '#444',
    fontWeight: '700',
  },
});

export const memberCardStyles = StyleSheet.create({
  memberCard: {
    backgroundColor: 'rgba(47, 72, 88, 0.1)',
    borderRadius: scale(12),
    marginBottom: scale(8),
    marginHorizontal: scale(16),
    shadowColor: 'rgba(47, 72, 88, 1.0)',
    shadowOffset: {
      width: scale(0),
      height: scale(1),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(2),
    elevation: 2,
  },
  memberCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(16),
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberIconContainer: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(16),
    backgroundColor: 'rgba(47, 72, 88, 0.3)',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(4),
  },
  memberName: {
    fontSize: scale(17),
    fontWeight: '700',
    color: '#2F4858',
    marginRight: scale(8),
  },
  roleContainer: {
    backgroundColor: 'rgba(47, 72, 88, 0.3)',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(12),
  },
  roleText: {
    fontSize: scale(12),
    fontWeight: '700',
    color: '#2F4858',
  },
  joinDate: {
    fontSize: scale(14),
    color: '#2F4858',
  },
  memberRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    padding: scale(4),
  },
  // 모달 메시지 스타일
  modalMessage: {
    fontSize: scale(15),
    color: '#666',
    textAlign: 'center',
  },
  modalMemberName: {
    fontSize: scale(16),
    color: 'tomato',
    fontWeight: '700',
  },
});

export const memberItemStyles = StyleSheet.create({
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
  settingsItemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  settingsItemTitle: {
    fontSize: scale(17),
    fontWeight: '600',
    color: '#2F4858',
    marginBottom: scale(2),
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
    color: '#2F4858',
  },
  sectionDescription: {
    fontSize: scale(14),
    color: '#6B7280',
    lineHeight: scale(20),
    marginBottom: scale(4),
  },
  // Right Section
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemArrow: {
    marginLeft: scale(4),
  },
});

export const memberManagementStyles = StyleSheet.create({
  // 설정 그룹
  settingsGroup: {
    backgroundColor: 'white',
    marginBottom: scale(16),
    borderRadius: scale(12),
    marginHorizontal: scale(16),
    paddingVertical: scale(8),
    overflow: 'hidden',
  },
  // 그룹 헤더
  groupHeader: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
  },
  groupTitle: {
    fontSize: scale(18),
    fontWeight: '900',
    color: '#333',
  },
});

export const modalSettingsItemStyles = StyleSheet.create({
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scale(16),
    paddingHorizontal: scale(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: scale(1),
    borderBottomColor: '#F3F4F6',
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
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: scale(16),
    fontWeight: '500',
    color: '#1F2937',
  },
});
