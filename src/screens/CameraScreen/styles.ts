// screens/CameraScreen/styles.ts
import { StyleSheet } from 'react-native';

const shadows = {
  small: {
    shadowColor: '#222222',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#222222',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#222222',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8f8f8',
    textAlign: 'center',
  },
  rightHeader: {
    width: 44,
    height: 44,
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
    paddingBottom: 40,
  },

  modeOptions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  modeButton: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 24,
    marginVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },

  modeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  modeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8f8f8',
    marginBottom: 8,
    textAlign: 'center',
  },

  modeDescription: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 20,
  },

  // 개발자 도구 구분선 (추가)
  divider: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
    paddingVertical: 10,
  },
  dividerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#555555',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },

  cameraButtonText: {
    fontSize: 16,
    color: '#f8f8f8',
    fontWeight: '500',
  },

  bottomGuide: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },

  guideText: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 20,
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
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
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
    borderRadius: 12,
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
    borderRadius: 12,
  },

  loadingText: {
    color: '#f8f8f8',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },

  scanningText: {
    color: '#f8f8f8',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },

  bottomInfo: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },

  infoText: {
    color: '#f8f8f8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },

  subInfoText: {
    color: '#cccccc',
    fontSize: 14,
    textAlign: 'center',
  },

  imagePlace: {
    position: 'relative',
    alignItems: 'center',
  },

  previewImage: {
    borderRadius: 12,
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'space-between',
    gap: 8,
  },

  retakeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
    minHeight: 60,
  },

  ingredientButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50', // 초록색
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
    minHeight: 60,
  },

  receiptButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3', // 파란색
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
    minHeight: 60,
  },

  manualButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800', // 주황색
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
    minHeight: 60,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  retakeButtonText: {
    color: '#333',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  ingredientButtonText: {
    color: '#f8f8f8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  receiptButtonText: {
    color: '#f8f8f8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  manualButtonText: {
    color: '#f8f8f8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  scanningText: {
    color: '#f8f8f8',
    fontSize: 14,
    marginTop: 12,
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
    paddingVertical: 12,
    backgroundColor: '#222222',
  },
  closeButton: {
    width: 56,
    padding: 8,
    paddingLeft: 0,
    marginLeft: 10,
  },
  headerTitle: { fontWeight: '600', fontSize: 18, color: '#f8f8f8' },
  rightSection: {
    width: 60,
  },

  // Image Preview Styles
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  imagePlace: {
    borderRadius: 16,
    marginTop: 15,
    borderCurve: 'continuous',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  previewImage: {
    borderRadius: 16,
  },

  // Photo Info Styles
  photoInfoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#222222',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoSizeText: {
    fontSize: 12,
    color: '#CCCCCC',
  },

  // Buttons
  bottomButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#222222',
    gap: 12,
  },
  // Retake Button
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    gap: 8,
    minHeight: 48,
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  // Use Button
  useButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#73d144ff',
    borderRadius: 8,
    gap: 8,
    minHeight: 48,
    ...shadows.small,
  },
  useButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8f8f8',
  },
});
