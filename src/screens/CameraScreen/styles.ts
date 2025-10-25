import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
// const baseHeight = 874;

// 반응형 함수
// const wp = (percentage: number) => (width * percentage) / 100;
// const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

const shadows = {
  small: {
    shadowColor: '#222222',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
  },
  medium: {
    shadowColor: '#222222',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: scale(8),
    elevation: 5,
  },
};

// Main CameraScreen styles

export const cameraStyles = StyleSheet.create({
  // 기본 컨테이너
  container: {
    flex: 1,
    backgroundColor: '#222222',
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#222222',
  },
  closeButton: {
    width: scale(44),
    height: scale(44),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(22),
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#f8f8f8',
    textAlign: 'center',
  },
  rightHeader: {
    width: scale(44),
    height: scale(44),
  },

  // 모드 선택 화면
  modeSelectionContainer: {
    flex: 1,
    backgroundColor: '#222222',
  },

  // 스크롤 관련 (추가)
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: scale(40),
  },

  modeOptions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: scale(20),
  },

  modeButton: {
    width: '100%',
    maxWidth: scale(320),
    backgroundColor: '#333333',
    borderRadius: scale(16),
    padding: scale(24),
    marginVertical: scale(12),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },

  modeIconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(16),
  },

  modeTitle: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#f8f8f8',
    marginBottom: scale(8),
    textAlign: 'center',
  },

  modeDescription: {
    fontSize: scale(14),
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: scale(20),
  },

  // 개발자 도구 구분선 (추가)
  divider: {
    width: '100%',
    alignItems: 'center',
    marginVertical: scale(20),
    paddingVertical: scale(10),
  },
  dividerText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#444',
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(20),
  },

  // 카메라 실행 화면
  cameraLaunchContainer: {
    flex: 1,
    backgroundColor: '#222222',
  },

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cameraButton: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: '#555555',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },

  cameraButtonText: {
    fontSize: scale(16),
    color: '#f8f8f8',
    fontWeight: '500',
  },

  bottomGuide: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(40),
    alignItems: 'center',
  },

  guideText: {
    fontSize: scale(14),
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: scale(20),
  },

  // 로딩 오버레이 (추가)
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: '500',
    marginTop: scale(12),
  },

  // 비활성화된 버튼 (추가)
  disabledButton: {
    opacity: 0.5,
  },
});

// PhotoPreview styles //////////////////////////////////////////////////////////////////////////////
export const previewStyles = StyleSheet.create({
  // PhotoPreview 스캔 중 스타일
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: scale(12),
  },

  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: scale(12),
  },

  loadingText: {
    color: '#f8f8f8',
    fontSize: scale(16),
    marginTop: scale(16),
    textAlign: 'center',
  },

  scanningText: {
    color: '#f8f8f8',
    fontSize: scale(16),
    marginTop: scale(16),
    textAlign: 'center',
    fontWeight: '500',
  },

  bottomInfo: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(30),
    alignItems: 'center',
  },

  infoText: {
    color: '#f8f8f8',
    fontSize: scale(16),
    textAlign: 'center',
    marginBottom: scale(8),
    fontWeight: '500',
  },

  subInfoText: {
    color: '#cccccc',
    fontSize: scale(14),
    textAlign: 'center',
  },
  imagePlace: {
    borderRadius: scale(16),
    marginTop: scale(15),
    borderCurve: 'continuous',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  previewImage: {
    borderRadius: scale(16),
  },
  // Buttons
  bottomButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(20),
    backgroundColor: '#222222',
    gap: scale(12),
  },
  // Retake Button
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(14),
    backgroundColor: '#f8f8f8',
    borderRadius: scale(8),
    gap: scale(8),
    minHeight: scale(48),
  },
  retakeButtonText: {
    color: '#333',
    fontSize: scale(11),
    fontWeight: '600',
    textAlign: 'center',
  },

  ingredientButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50', // 초록색
    paddingVertical: scale(12),
    paddingHorizontal: scale(8),
    borderRadius: scale(8),
    gap: scale(4),
    minHeight: scale(60),
  },

  receiptButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3', // 파란색
    paddingVertical: scale(12),
    paddingHorizontal: scale(8),
    borderRadius: scale(8),
    gap: scale(4),
    minHeight: scale(60),
  },

  manualButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800', // 주황색
    paddingVertical: scale(12),
    paddingHorizontal: scale(8),
    borderRadius: scale(8),
    gap: scale(4),
    minHeight: scale(60),
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  ingredientButtonText: {
    color: '#f8f8f8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  receiptButtonText: {
    color: '#f8f8f8',
    fontSize: scale(11),
    fontWeight: '600',
    textAlign: 'center',
  },

  manualButtonText: {
    color: '#f8f8f8',
    fontSize: scale(11),
    fontWeight: '600',
    textAlign: 'center',
  },

  /////////////////////////////////////////

  previewContainer: {
    flex: 1,
    backgroundColor: '#222222',
  },

  // Header Styles
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scale(12),
    backgroundColor: '#222222',
  },
  closeButton: {
    width: scale(56),
    padding: scale(8),
    paddingLeft: scale(0),
    marginLeft: scale(10),
  },
  headerTitle: { fontWeight: '600', fontSize: 18, color: '#f8f8f8' },
  rightSection: {
    width: scale(60),
  },

  // Image Preview Styles
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scale(10),
  },

  // Photo Info Styles
  photoInfoContainer: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#222222',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoSizeText: {
    fontSize: scale(12),
    color: '#CCCCCC',
  },

  // Use Button
  useButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(14),
    backgroundColor: '#73d144ff',
    borderRadius: scale(8),
    gap: scale(8),
    minHeight: scale(48),
    ...shadows.small,
  },
  useButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#f8f8f8',
  },
});
