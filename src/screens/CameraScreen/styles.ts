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
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#f8f8f8',
    flex: 1,
    textAlign: 'center',
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
    fontSize: 16,
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
    marginBottom: 8,
  },
  subGuideText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
});

// PhotoPreview styles //////////////////////////////////////////////////////////////////////////////
export const previewStyles = StyleSheet.create({
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
