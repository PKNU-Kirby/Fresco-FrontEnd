// screens/CameraScreen/PhotoPreview.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomText from '../../components/common/CustomText';
import { previewStyles as styles } from './styles';

type PhotoPreviewNavigationProp = NativeStackNavigationProp<any>;

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
  onPhotoUpdate?: (updatedPhoto: CapturedPhoto) => void;
  onAdditionalPhoto?: (newPhoto: CapturedPhoto) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  photo,
  onRetake,
  onUse,
  onCancel,
  onPhotoUpdate,
  onAdditionalPhoto,
}) => {
  const navigation = useNavigation<PhotoPreviewNavigationProp>();
  const route = useRoute();

  const [currentPhoto, setCurrentPhoto] = useState<CapturedPhoto>(photo);
  const [additionalPhotos, setAdditionalPhotos] = useState<CapturedPhoto[]>([]);
  const [imageLoading, setImageLoading] = useState(true);

  const getImageStyle = useCallback(() => {
    if (photo.width && photo.height) {
      const aspectRatio = photo.width / photo.height;
      const maxWidth = screenWidth;
      const maxHeight = screenHeight * 0.5;

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
      width: screenWidth * 0.9,
      height: screenWidth * 0.9 * 0.75,
    };
  }, [photo.width, photo.height]);

  useFocusEffect(
    useCallback(() => {
      const params = route.params as any;

      if (params?.croppedPhotoUri) {
        const croppedPhoto: CapturedPhoto = {
          ...currentPhoto,
          uri: params.croppedPhotoUri,
          fileName: `cropped_${Date.now()}.jpg`,
        };

        setCurrentPhoto(croppedPhoto);
        onPhotoUpdate?.(croppedPhoto);
        navigation.setParams({ croppedPhotoUri: undefined });
      }

      if (params?.additionalPhotoUri) {
        const newPhoto: CapturedPhoto = {
          uri: params.additionalPhotoUri,
          fileName: `additional_${Date.now()}.jpg`,
        };

        setAdditionalPhotos(prev => [...prev, newPhoto]);
        onAdditionalPhoto?.(newPhoto);
        navigation.setParams({ additionalPhotoUri: undefined });
      }
    }, [
      route.params,
      currentPhoto,
      navigation,
      onPhotoUpdate,
      onAdditionalPhoto,
    ]),
  );

  const handleCropPress = useCallback(() => {
    navigation.navigate('CropView', {
      photoUri: currentPhoto.uri,
      onCropComplete: (croppedUri: string) => {
        const croppedPhoto: CapturedPhoto = {
          ...currentPhoto,
          uri: croppedUri,
          fileName: `cropped_${Date.now()}.jpg`,
        };

        setCurrentPhoto(croppedPhoto);
        onPhotoUpdate?.(croppedPhoto);
        navigation.goBack();
      },
    });
  }, [currentPhoto, navigation, onPhotoUpdate]);

  const handleAdditionalPhotoPress = useCallback(() => {
    navigation.navigate('CameraView', {
      onPhotoCapture: (photoUri: string) => {
        const newPhoto: CapturedPhoto = {
          uri: photoUri,
          fileName: `additional_${Date.now()}.jpg`,
        };

        setAdditionalPhotos(prev => [...prev, newPhoto]);
        onAdditionalPhoto?.(newPhoto);

        Alert.alert('완료', '추가 사진이 저장되었습니다!');
      },
    });
  }, [navigation, onAdditionalPhoto]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    Alert.alert('오류', '이미지를 불러올 수 없습니다.');
  }, []);

  const formatFileSize = useCallback((bytes?: number): string => {
    if (!bytes) return '';
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }, []);

  return (
    <View style={styles.previewContainer}>
      <View style={styles.previewHeader}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onCancel}
          accessibilityLabel="닫기"
          accessibilityRole="button"
        >
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>미리보기</CustomText>
        <TouchableOpacity
          style={styles.useButton}
          onPress={onUse}
          accessibilityLabel="등록"
          accessibilityRole="button"
        >
          <CustomText style={styles.useButtonText}>등록</CustomText>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        {imageLoading && (
          <View
            style={[
              styles.previewImage,
              getImageStyle(),
              { justifyContent: 'center', alignItems: 'center' },
            ]}
          >
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        <Image
          source={{ uri: currentPhoto.uri }}
          style={[styles.previewImage, getImageStyle()]}
          resizeMode="contain"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </View>

      <View style={styles.photoInfoContainer}>
        {photo.fileSize && (
          <CustomText style={styles.photoSizeText}>
            {formatFileSize(photo.fileSize)}
          </CustomText>
        )}
        {additionalPhotos.length > 0 && (
          <CustomText style={styles.photoSizeText}>
            추가 사진: {additionalPhotos.length}개
          </CustomText>
        )}
      </View>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.retakeButton}
          onPress={onRetake}
          accessibilityLabel="다시 촬영"
          accessibilityRole="button"
        >
          <MaterialIcons name="camera-alt" size={20} color="#333" />
          <CustomText style={styles.retakeButtonText}>다시 촬영</CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.usePhotoButton}
          onPress={onUse}
          accessibilityLabel="사진 사용"
          accessibilityRole="button"
        >
          <MaterialIcons name="check" size={20} color="#fff" />
          <CustomText style={styles.usePhotoButtonText}>사진 사용</CustomText>
        </TouchableOpacity>
      </View>

      <View style={styles.additionalOptions}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleCropPress}
          accessibilityLabel="이미지 자르기"
          accessibilityRole="button"
        >
          <MaterialIcons name="crop" size={18} color="#666" />
          <CustomText style={styles.optionButtonText}>자르기</CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleAdditionalPhotoPress}
          accessibilityLabel="추가 촬영"
          accessibilityRole="button"
        >
          <MaterialIcons name="add-a-photo" size={18} color="#666" />
          <CustomText style={styles.optionButtonText}>추가 촬영</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PhotoPreview;
