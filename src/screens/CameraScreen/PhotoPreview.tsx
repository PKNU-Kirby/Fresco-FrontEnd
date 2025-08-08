import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Text,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { previewStyles as styles } from './styles';
import { RootStackParamList } from '../../../App';

type PhotoPreviewScreenRouteProp = RouteProp<
  RootStackParamList,
  'PhotoPreview'
>;
type PhotoPreviewScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PhotoPreview'
>;

const dimensions = Dimensions.get('window');
const screenWidth = dimensions?.width || 375;

const PhotoPreviewScreen: React.FC = () => {
  const navigation = useNavigation<PhotoPreviewScreenNavigationProp>();
  const route = useRoute<PhotoPreviewScreenRouteProp>();

  const { photo, fridgeId } = route.params;
  const [imageLoading, setImageLoading] = useState(true);

  const getImageStyle = useCallback(() => {
    if (photo.width && photo.height) {
      const aspectRatio = photo.width / photo.height;
      const imageWidth = screenWidth * 0.95;
      const imageHeight = imageWidth / aspectRatio;

      const maxHeight = screenWidth * 1.2;
      if (imageHeight > maxHeight) {
        return {
          width: maxHeight * aspectRatio,
          height: maxHeight,
        };
      }

      return {
        width: imageWidth,
        height: imageHeight,
      };
    }

    return {
      width: screenWidth * 0.95,
      height: screenWidth * 0.95 * 0.75,
    };
  }, [photo.width, photo.height]);

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

  const handleRetake = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCancel = useCallback(() => {
    Alert.alert('취소하시겠습니까?', '촬영한 사진이 삭제됩니다.', [
      { text: '계속 편집', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => {
          navigation.goBack();
        },
      },
    ]);
  }, [navigation]);

  const handleUse = useCallback(() => {
    navigation.navigate('AddItemScreen', {
      fridgeId,
      recognizedData: {
        photo: photo.uri,
        name: '인식된 식재료',
        quantity: '1',
        unit: '개',
        expiryDate: '',
        storageType: '냉장',
        itemCategory: '야채',
      },
    });
  }, [navigation, photo.uri, fridgeId]);

  return (
    <SafeAreaView style={styles.previewContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#222222" />

      <View style={styles.previewHeader}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleCancel}
          accessibilityLabel="닫기"
          accessibilityRole="button"
        >
          <MaterialIcons name="arrow-back-ios-new" size={24} color="#f8f8f8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>미리보기</Text>
        <TouchableOpacity
          style={styles.useButton}
          onPress={handleUse}
          accessibilityLabel="등록"
          accessibilityRole="button"
        >
          <Text style={styles.useButtonText}>등록</Text>
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
            <ActivityIndicator size="large" color="#f8f8f8" />
          </View>
        )}
        <View style={styles.imagePlace}>
          <Image
            source={{ uri: photo.uri }}
            style={[styles.previewImage, getImageStyle()]}
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          <View style={styles.photoInfoContainer}>
            {photo.fileSize && (
              <Text style={styles.photoSizeText}>
                {formatFileSize(photo.fileSize)}
              </Text>
            )}
            {photo.width && photo.height && (
              <Text style={styles.photoSizeText}>
                {photo.width} × {photo.height}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.retakeButton}
          onPress={handleRetake}
          accessibilityLabel="다시 촬영"
          accessibilityRole="button"
        >
          <MaterialIcons name="camera-alt" size={20} color="#333" />
          <Text style={styles.retakeButtonText}>다시 촬영</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.useButton}
          onPress={handleUse}
          accessibilityLabel="사진 등록"
          accessibilityRole="button"
        >
          <MaterialIcons name="add" size={20} color="#f8f8f8" />
          <Text style={styles.useButtonText}>사진 등록하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PhotoPreviewScreen;
