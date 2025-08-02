import React from 'react';
import { View, Image, TouchableOpacity, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../components/common/CustomText';
import { styles } from './styles';

interface CapturedPhoto {
  uri: string;
  width?: number;
  height?: number;
  fileSize?: number;
  type?: string;
  fileName?: string;
}

interface PhotoPreviewProps {
  photo: CapturedPhoto;
  onRetake: () => void;
  onUse: () => void;
  onCancel: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  photo,
  onRetake,
  onUse,
  onCancel,
}) => {
  // 이미지 크기 계산 (화면에 맞게 조정)
  const getImageStyle = () => {
    if (photo.width && photo.height) {
      const aspectRatio = photo.width / photo.height;
      const maxWidth = screenWidth;
      const maxHeight = screenHeight * 0.7; // 화면의 70% 사용

      let imageWidth = maxWidth;
      let imageHeight = maxWidth / aspectRatio;

      if (imageHeight > maxHeight) {
        imageHeight = maxHeight;
        imageWidth = maxHeight * aspectRatio;
      }

      return {
        width: imageWidth,
        height: imageHeight,
      };
    }

    return {
      width: screenWidth,
      height: screenWidth * 0.75, // 기본 4:3 비율
    };
  };

  return (
    <View style={styles.previewContainer}>
      {/* 상단 헤더 */}
      <View style={styles.previewHeader}>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>사진 미리보기</CustomText>
        <TouchableOpacity style={styles.useButton} onPress={onUse}>
          <CustomText style={styles.useButtonText}>등록</CustomText>
        </TouchableOpacity>
      </View>

      {/* 사진 미리보기 */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: photo.uri }}
          style={[styles.previewImage, getImageStyle()]}
          resizeMode="contain"
        />
      </View>

      {/* 사진 정보 */}
      <View style={styles.photoInfoContainer}>
        <CustomText style={styles.photoInfoText}>
          {photo.fileName || '식재료 사진'}
        </CustomText>
        {photo.fileSize && (
          <CustomText style={styles.photoSizeText}>
            {(photo.fileSize / 1024 / 1024).toFixed(1)} MB
          </CustomText>
        )}
      </View>

      {/* 하단 버튼들 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
          <MaterialIcons name="camera-alt" size={20} color="#333" />
          <CustomText style={styles.retakeButtonText}>다시 촬영</CustomText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.usePhotoButton} onPress={onUse}>
          <MaterialIcons name="check" size={20} color="#fff" />
          <CustomText style={styles.usePhotoButtonText}>사진 사용</CustomText>
        </TouchableOpacity>
      </View>

      {/* 추가 옵션 버튼들 */}
      <View style={styles.additionalOptions}>
        <TouchableOpacity style={styles.optionButton}>
          <MaterialIcons name="crop" size={18} color="#666" />
          <CustomText style={styles.optionButtonText}>자르기</CustomText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton}>
          <MaterialIcons name="add-a-photo" size={18} color="#666" />
          <CustomText style={styles.optionButtonText}>추가 촬영</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PhotoPreview;
