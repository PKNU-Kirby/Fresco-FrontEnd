import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomText from '../../components/common/CustomText';
import { styles } from './styles';

type RootStackParamList = {
  CropView: {
    photoUri: string;
    onCropComplete: (croppedUri: string) => void;
  };
  CameraView: { onPhotoCapture: (photoUri: string) => void };
};

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
  console.log('additionalPhotos: ', additionalPhotos);

  useFocusEffect(
    React.useCallback(() => {
      const params = route.params as any;

      if (params?.croppedPhotoUri) {
        const croppedPhoto: CapturedPhoto = {
          ...currentPhoto,
          uri: params.croppedPhotoUri,
          fileName: `cropped_${Date.now()}.jpg`,
        };

        setCurrentPhoto(croppedPhoto);

        if (onPhotoUpdate) {
          onPhotoUpdate(croppedPhoto);
        }

        navigation.setParams({ croppedPhotoUri: undefined });
      }

      if (params?.additionalPhotoUri) {
        const newPhoto: CapturedPhoto = {
          uri: params.additionalPhotoUri,
          fileName: `additional_${Date.now()}.jpg`,
        };

        setAdditionalPhotos(prev => [...prev, newPhoto]);

        if (onAdditionalPhoto) {
          onAdditionalPhoto(newPhoto);
        }

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

  const getImageStyle = () => {
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
      height: screenWidth * 0.9 * 0.75, // 4:3
    };
  };

  const handleCropPress = () => {
    navigation.navigate('CropView', {
      photoUri: photo.uri,
      onCropComplete: (croppedUri: string) => {
        const croppedPhoto: CapturedPhoto = {
          ...photo,
          uri: croppedUri,
          fileName: `cropped_${Date.now()}.jpg`,
        };

        if (onPhotoUpdate) {
          onPhotoUpdate(croppedPhoto);
        }

        navigation.goBack();
      },
    });
  };

  const handleAdditionalPhotoPress = () => {
    navigation.navigate('CameraView', {
      onPhotoCapture: (photoUri: string) => {
        const newPhoto: CapturedPhoto = {
          uri: photoUri,
          fileName: `additional_${Date.now()}.jpg`,
        };

        if (onAdditionalPhoto) {
          onAdditionalPhoto(newPhoto);
        }

        Alert.alert('완료', '추가 사진이 저장되었습니다!');
      },
    });
  };
  return (
    <View style={styles.previewContainer}>
      {/* Header */}
      <View style={styles.previewHeader}>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>미리보기</CustomText>
        <TouchableOpacity style={styles.useButton} onPress={onUse}>
          <CustomText style={styles.useButtonText}>등록</CustomText>
        </TouchableOpacity>
      </View>

      {/* Photo Preview */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: currentPhoto.uri }}
          style={[styles.previewImage, getImageStyle()]}
          resizeMode="contain"
        />
      </View>

      {/* Photo Info */}
      <View style={styles.photoInfoContainer}>
        {photo.fileSize && (
          <CustomText style={styles.photoSizeText}>
            {(photo.fileSize / 1024 / 1024).toFixed(1)} MB
          </CustomText>
        )}
      </View>

      {/* Bottom Buttons */}
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

      {/* Additional Option Buttons */}
      <View style={styles.additionalOptions}>
        <TouchableOpacity style={styles.optionButton} onPress={handleCropPress}>
          <MaterialIcons name="crop" size={18} color="#666" />
          <CustomText style={styles.optionButtonText}>자르기</CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleAdditionalPhotoPress}
        >
          <MaterialIcons name="add-a-photo" size={18} color="#666" />
          <CustomText style={styles.optionButtonText}>추가 촬영</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PhotoPreview;
