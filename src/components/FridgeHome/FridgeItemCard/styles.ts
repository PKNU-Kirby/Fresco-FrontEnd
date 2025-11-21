// FridgeHome -> FridgeItemCard/ styles
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
// const baseHeight = 874;

// 반응형 함수
// const wp = (percentage: number) => (width * percentage) / 100;
// const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

// Delete Button Styles : './DeleteButton.tsx'
export const deleteButtonStyles = StyleSheet.create({
  deleteItemButtonContainer: {
    position: 'absolute',
    top: scale(4),
    right: scale(4),
    width: scale(40),
    height: scale(40),
  },
  deleteItemButton: {
    position: 'absolute',
    top: scale(4),
    right: scale(4),
    backgroundColor: '#999',
    width: scale(24),
    height: scale(24),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
});

// Item Card Styles : './index.tsx'
export const cardStyles = StyleSheet.create({
  // 헤더
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(0),
  },
  // 카드 전체 배경 스타일
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: scale(16),
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: scale(5),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
    position: 'relative',
  },

  // 소비기한 별 카드 스타일 ////////////////////////////////////////////////////////////////////////////////////////
  cardExpiringSoon: {
    borderWidth: scale(1),
    borderColor: 'rgba(255, 200, 170, 0.25)',
    backgroundColor: '#fbe5d9ff',
  },
  cardExpired: {
    borderWidth: scale(1),
    borderColor: 'rgba(255, 199, 199, 0.25)',
    backgroundColor: '#ffc7c7ff',
    opacity: 0.85,
  },

  // 아이템 아이콘 이미지 스타일 /////////////////////////////////////////////////////////////////////////////////////
  itemImageContainer: {
    marginRight: scale(16),
  },
  itemImagePlaceholder: {
    borderRadius: scale(8),
    width: scale(60),
    height: scale(60),
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 식재료 정보 부분 스타일 ////////////////////////////////////////////////////////////////////////////////////////
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#333',
    lineHeight: scale(30),
    flex: 1,
    marginRight: scale(0),
  },

  // 소비기한 경고 배지 스타일 ///////////////////////////////////////////////////////////////////////////////////////
  expiryBadge: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    backgroundColor: '#ffc8aaff',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(10),
    zIndex: 10,
  },
  // 소비기한 만료 배지
  expiredBadge: {
    backgroundColor: '#ff7b82ff',
  },
  // 배지 텍스트
  expiryBadgeText: {
    color: '#1a2831ff',
    fontSize: scale(13),
    fontWeight: 'bold',
  },

  // 소비기한 텍스트 스타일 /////////////////////////////////////////////////////////////////////////////////////////
  // 소비기한 Container
  expiaryContainer: {
    marginBottom: scale(4),
    marginRight: scale(6),
    paddingHorizontal: scale(0),
  },

  // 편집 모드 소비기한
  editableExpiry: {
    marginLeft: scale(10),
    fontWeight: '500',
    marginRight: scale(24),
    color: '#32CD32',
  },
  // 편집 모드 소비기한 - 임박
  editableExpirySoon: {
    marginLeft: scale(10),
    fontWeight: '700',
    marginRight: scale(24),
    color: '#ff762dff',
  },
  // 편집 모드 소비기한 - 만료 상태
  editableExpiryExpired: {
    marginLeft: scale(10),
    fontWeight: '700',
    marginRight: scale(24),
    color: '#ff3a44ff',
    textDecorationLine: 'line-through',
  },

  // 소비기한 텍스트 스타일 ///////////////////////////
  expiryTextSoon: {
    color: '#1a2831ff',
    fontWeight: 'bold',
  },
  expiryTextExpired: {
    color: '#1a2831ff',
    fontWeight: 'bold',
    textDecorationLine: 'line-through',
  },
  itemExpiary: {
    fontSize: scale(14),
    color: '#666',
    paddingHorizontal: scale(4),
  },
  // 편집모드 소비기한 텍스트 스타일 ////////////////////
  itemExpiryNormal: {
    fontSize: scale(14),
    color: '#666',
    textAlign: 'right',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: scale(4),
  },
  itemExpiringSoon: {
    fontSize: scale(14),
    color: '#666',
    textAlign: 'right',
    backgroundColor: 'rgba(255, 200, 170, 09)',
    paddingHorizontal: scale(4),
  },
  itemExpired: {
    fontSize: scale(14),
    color: '#666',
    textAlign: 'right',
    backgroundColor: '#FF9F9F',
    paddingHorizontal: scale(4),
  },
  // 식재료 수량 스타일 //////////////////////////////

  // 슬라이더 수량 편집기 스타일
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantityContainer: {
    minWidth: scale(32),
    marginBottom: scale(4),
  },
  itemQuantity: {
    fontSize: scale(14),
    color: '#666',
    marginRight: scale(12),
  },

  // 카테고리 정보 텍스트 스타일
  itemStatus: {
    fontSize: scale(12),
    color: '#999',
    fontStyle: 'italic',
  },
  message: {
    fontSize: scale(15),
    color: '#666',
    textAlign: 'center',
  },
  emphmessage: {
    fontSize: scale(16),
    color: 'tomato',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

// Quantity Edit Style : './QuantityEditor.tsx'
export const quantityStyles = StyleSheet.create({
  quantityEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: scale(12),
    backgroundColor: '#f8f8f8',
    borderRadius: scale(8),
    paddingHorizontal: scale(4),
    width: scale(172),
  },
  // - / + 버튼 스타일
  quantityButton: {
    margin: scale(3),
    opacity: 0.5,
  },
  // 수량 - 사용자 직접 입력부 스타일
  quantityInput: {
    flex: 1,
    minWidth: scale(30),
    textAlign: 'center',
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: scale(8),
  },
  // 단위 입력부 스타일
  quantityUnit: {
    fontSize: scale(14),
    color: '#666',
    marginRight: scale(4),
  },
  unitSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(6),
    paddingVertical: scale(4),
    backgroundColor: '#fff',
    borderRadius: scale(6),
    borderWidth: scale(1),
    borderColor: '#ddd',
    marginRight: scale(4),
  },
  unitDropdownIcon: {
    fontSize: scale(10),
    color: '#666',
    marginLeft: scale(2),
  },
});

// UnitSclector Styles
export const unitSelectorStyles = StyleSheet.create({
  unitModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitModalContent: {
    backgroundColor: '#fff',
    borderRadius: scale(16),
    padding: scale(24),
    width: '80%',
    maxHeight: scale(300),
    alignItems: 'center',
  },
  unitModalTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: scale(20),
  },
  unitOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
    marginBottom: scale(20),
  },
  unitOption: {
    paddingVertical: scale(10),
    backgroundColor: '#f0f0f0',
    borderRadius: scale(16),
    minWidth: scale(46),
    alignItems: 'center',
  },
  unitOptionSelected: {
    backgroundColor: '#333',
  },
  unitOptionText: {
    fontSize: scale(16),
    color: '#333',
    fontWeight: '500',
  },
  unitOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  unitModalCloseButton: {
    paddingVertical: scale(12),
    paddingHorizontal: scale(12),
    backgroundColor: '#f0f0f0',
    borderRadius: scale(8),
    alignItems: 'center',
  },
  unitModalCloseText: {
    fontSize: scale(16),
    color: '#333',
    fontWeight: '600',
  },
});

// Slider Quantity Editor Style : './SliderQuantityEditor.tsx'
export const sliderQuantityStyles = StyleSheet.create({
  quantityEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: scale(230),
  },
  stepper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f6f6f6',
    paddingVertical: scale(4),
    borderRadius: scale(8),
    marginRight: scale(8),
  },
  quantityButton: {
    padding: scale(4),
  },
  quantityInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#444',
  },
  quantityUnit: {
    fontSize: scale(14),
    color: '#666',
    fontWeight: '700',
    marginRight: scale(4),
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    paddingVertical: scale(6),
    borderRadius: scale(6),
    borderWidth: scale(1),
    borderColor: '#e3e3e3',
    backgroundColor: 'white',
    marginRight: scale(8),
  },
  unitDropdownIcon: {
    fontSize: scale(10),
    color: '#666',
    marginLeft: scale(2),
  },
  isSlidderButton: {
    width: scale(36),
    height: scale(36),
    marginLeft: scale(8),
    backgroundColor: '#f6f6f6',
    borderRadius: scale(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  isNotSlidderButton: {
    width: scale(36),
    height: scale(36),
    marginLeft: scale(8),
    backgroundColor: '#f6f6f6',
    borderRadius: scale(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderQuantityContainer: {
    marginTop: scale(8),
    minWidth: scale(260),
  },
  maxQuantityInfo: {
    alignItems: 'center',
  },
  maxQuantityText: {
    fontSize: scale(10),
    color: '#999',
    fontStyle: 'italic',
  },
  sliderSection: {
    marginTop: scale(18),
  },
  sliderContainer: {
    position: 'relative',
  },
  slider: {
    width: '100%',
    height: scale(12),
    backgroundColor: 'rgba(47, 72, 88, 0.5)',
    borderRadius: scale(6),
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(10),
    marginTop: scale(12),
  },
  sliderLabel: {
    fontSize: scale(14),
    color: '#666',
    fontWeight: '800',
  },
});
