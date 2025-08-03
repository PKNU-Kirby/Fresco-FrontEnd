import { StyleSheet } from 'react-native';
// import { Dimensions } from 'react-native';
// const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // 기본 컨테이너
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // 카메라 실행 화면
  cameraLaunchContainer: {
    flex: 1,
    backgroundColor: '#000',
  },

  // 공통 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40, // closeButton과 동일한 크기로 중앙 정렬
  },

  // 카메라 실행 화면 중앙 컨텐츠
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  cameraButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#666',
  },
  cameraButtonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },

  // 하단 안내
  bottomGuide: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  guideText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subGuideText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },

  // 사진 미리보기 화면
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  useButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  useButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },

  // 이미지 컨테이너
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  previewImage: {
    borderRadius: 8,
  },

  // 사진 정보
  photoInfoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  photoInfoText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  photoSizeText: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },

  // 하단 버튼들
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    gap: 8,
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  usePhotoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    gap: 8,
  },
  usePhotoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // 추가 옵션 버튼들
  additionalOptions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    gap: 32,
  },
  optionButton: {
    alignItems: 'center',
    gap: 4,
  },
  optionButtonText: {
    fontSize: 12,
    color: '#666',
  },
});
