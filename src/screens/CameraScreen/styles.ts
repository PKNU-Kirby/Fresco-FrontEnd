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
  // styles.ts - CameraScreen 모드 선택 스타일
  modeSelectionContainer: {
    flex: 1,
    backgroundColor: '#222222',
  },

  modeOptions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 40,
  },
  modeButton: {
    backgroundColor: '#333333',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    borderWidth: 2,
    borderColor: '#444444',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  modeIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  modeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8f8f8',
    marginBottom: 12,
    textAlign: 'center',
  },

  modeDescription: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 22,
  },
  modeSelectionContainer: {
    flex: 1,
    backgroundColor: '#222222',
  },

  modeOptions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 30,
  },

  modeButton: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
    borderWidth: 1,
    borderColor: '#444444',
  },

  modeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  modeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f8f8f8',
    marginVertical: 16,
    textAlign: 'center',
  },

  modeDescription: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 20,
  },

  // PhotoPreviewScreen 버튼 스타일 (3개 버튼)
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
    gap: 8,
  },

  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    minHeight: 48,
  },

  scanButton: {
    flex: 1.2, // 중앙 버튼이 조금 더 크게
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    minHeight: 48,
  },

  scanButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },

  manualButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    minHeight: 48,
  },

  retakeButtonText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  scanButtonText: {
    color: '#f8f8f8',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  manualButtonText: {
    color: '#f8f8f8',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  scanningText: {
    color: '#f8f8f8',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },

  // 기존 스타일 수정사항
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#222222',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8f8f8',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  rightSection: {
    width: 40, // closeButton과 같은 크기로 균형 맞춤
  },

  /////////////////////////////////////////

  container: {
    flex: 1,
    backgroundColor: '#222222',
  },

  cameraLaunchContainer: {
    flex: 1,
    backgroundColor: '#222222',
  },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: '#222222',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    ...shadows.small,
  },
  closeButton: {
    width: 56,
    padding: 8,
    paddingLeft: 0,
    marginLeft: 10,
  },
  rightHeader: {
    width: 66,
    fontSize: 14,
    fontWeight: '600',
  },

  // Center Content Styles : Camera Button
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cameraButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 3,
    borderColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...shadows.medium,
  },
  cameraButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#999999',
    opacity: 0.6,
  },
  cameraButtonText: {
    fontSize: 20,
    color: '#f8f8f8',
    textAlign: 'center',
    marginTop: 8,
  },

  // Guide
  bottomGuide: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  guideText: {
    fontSize: 16,
    color: '#f8f8f8',
    textAlign: 'center',
    marginBottom: 16,
  },
  subGuideText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
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
