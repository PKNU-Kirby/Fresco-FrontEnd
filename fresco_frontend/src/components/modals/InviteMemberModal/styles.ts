import {StyleSheet, Dimensions} from 'react-native';

// const {width} = Dimensions.get('window');

export const styles = StyleSheet.create({
  // 모달 기본
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  inviteModalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },

  // 헤더
  inviteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  inviteModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  invisiblebox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '600',
  },

  // 냉장고 정보
  fridgeInfoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  fridgeNameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  fridgeSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // 링크 섹션
  linkSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dee2e6',
    overflow: 'hidden',
  },
  linkTextContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 13,
    color: '#495057',
    fontFamily: 'monospace',
  },
  copyLinkButton: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyLinkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // 공유 섹션
  shareSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  shareSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  shareButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  shareButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  shareButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  shareButtonEmoji: {
    fontSize: 24,
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },

  // 비활성화 상태 스타일 추가
  shareButtonDisabled: {
    opacity: 0.7,
  },
  shareButtonTextDisabled: {
    color: '#999',
  },
});
