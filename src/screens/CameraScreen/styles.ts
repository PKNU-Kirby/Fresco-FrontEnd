// screens/CameraScreen/styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const colors = {
  primary: '#007AFF',
  secondary: '#4CAF50',
  danger: '#FF3B30',

  black: '#000000',
  darkGray: '#333333',
  gray: '#666666',
  lightGray: '#999999',
  veryLightGray: '#CCCCCC',
  white: '#FFFFFF',

  blackOverlay: 'rgba(0, 0, 0, 0.8)',
  blackOverlayLight: 'rgba(0, 0, 0, 0.5)',
  whiteOverlay: 'rgba(255, 255, 255, 0.9)',
  whiteOverlayLight: 'rgba(255, 255, 255, 0.1)',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: colors.black,
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
    backgroundColor: colors.black,
  },

  cameraLaunchContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.blackOverlay,
  },

  closeButton: {
    width: 60,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },

  placeholder: {
    width: 60,
  },

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  cameraButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.whiteOverlayLight,
    borderWidth: 3,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    ...shadows.medium,
  },

  cameraButtonDisabled: {
    backgroundColor: colors.whiteOverlayLight,
    borderColor: colors.lightGray,
    opacity: 0.6,
  },

  cameraButtonText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  bottomGuide: {
    paddingHorizontal: spacing.xxxl,
    paddingBottom: 48,
    alignItems: 'center',
  },

  guideText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  subGuideText: {
    fontSize: 14,
    color: colors.veryLightGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});

// PhotoPreview styles
export const previewStyles = StyleSheet.create({
  previewContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },

  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.blackOverlay,
  },

  closeButton: {},
  headerTitle: {},
  useButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 60,
    alignItems: 'center',
  },

  useButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.secondary,
  },

  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },

  previewImage: {
    borderRadius: spacing.sm,
    maxWidth: '100%',
    maxHeight: '100%',
  },

  photoInfoContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.blackOverlay,
    borderTopWidth: 1,
    borderTopColor: colors.darkGray,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  photoSizeText: {
    fontSize: 12,
    color: colors.veryLightGray,
  },

  bottomButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: colors.blackOverlay,
    gap: spacing.md,
  },

  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#F0F0F0',
    borderRadius: spacing.sm,
    gap: spacing.sm,
    minHeight: 48,
  },

  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
  },

  usePhotoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: colors.secondary,
    borderRadius: spacing.sm,
    gap: spacing.sm,
    minHeight: 48,
    ...shadows.small,
  },

  usePhotoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },

  additionalOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    backgroundColor: colors.blackOverlay,
    justifyContent: 'center',
    gap: spacing.xxxl,
  },

  optionButton: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    minWidth: 60,
  },

  optionButtonText: {
    fontSize: 12,
    color: colors.lightGray,
    textAlign: 'center',
  },
});

// CropView styles
export const cropStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingContent: {
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: colors.white,
    marginTop: spacing.lg,
    textAlign: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.blackOverlay,
  },

  cancelButton: {
    padding: spacing.sm,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },

  doneButton: {
    backgroundColor: colors.darkGray,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    minWidth: 70,
    alignItems: 'center',
  },

  doneButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 40,
  },

  instructionText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },

  cropModeContainer: {
    marginBottom: 40,
  },

  cropModeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },

  cropModeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  cropModeButton: {
    backgroundColor: colors.whiteOverlayLight,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.whiteOverlayLight,
    minWidth: 70,
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },

  cropModeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  cropModeButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },

  cropModeButtonTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },

  actionButtons: {
    alignItems: 'center',
    gap: spacing.lg,
  },

  cropButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.lg,
    borderRadius: spacing.md,
    minWidth: screenWidth * 0.7,
    ...shadows.medium,
  },

  cropButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.sm,
  },

  previewButton: {
    backgroundColor: colors.whiteOverlayLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.whiteOverlayLight,
  },

  previewButtonText: {
    fontSize: 14,
    color: colors.lightGray,
    marginLeft: 6,
  },

  bottomGuide: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.whiteOverlayLight,
  },

  guideText: {
    fontSize: 14,
    color: colors.lightGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});

// CameraView styles
export const cameraViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingContent: {
    alignItems: 'center',
  },

  loadingText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.blackOverlay,
  },

  cancelButton: {
    padding: 8,
  },

  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },

  headerRight: {
    flexDirection: 'row',
  },

  headerButton: {
    padding: 8,
    marginLeft: 8,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  instructionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },

  instructionTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },

  instructionText: {
    color: colors.veryLightGray,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },

  settingsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },

  settingsTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },

  settingLabel: {
    color: colors.white,
    fontSize: 16,
    flex: 1,
  },

  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
  },

  settingButtonText: {
    color: colors.primary,
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },

  qualityButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  qualityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 50,
    alignItems: 'center',
  },

  qualityButtonActive: {
    backgroundColor: colors.primary,
  },

  qualityButtonText: {
    color: colors.veryLightGray,
    fontSize: 12,
    fontWeight: '500',
  },

  qualityButtonTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },

  cameraButtonContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  cameraButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  cameraButtonDisabled: {
    backgroundColor: colors.gray,
    shadowOpacity: 0,
    elevation: 0,
  },

  cameraButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  bottomGuide: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  guideText: {
    color: colors.lightGray,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export { colors, spacing, shadows };
