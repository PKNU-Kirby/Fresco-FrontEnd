// screens/CameraScreen/index.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import {
  launchCamera,
  ImagePickerResponse,
  MediaType,
  PhotoQuality,
} from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../components/common/CustomText';
import PhotoPreview from './PhotoPreview';
import { cameraStyles as styles } from './styles';

type CameraScreenRouteProp = RouteProp<RootStackParamList, 'CameraScreen'>;
type CameraScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CameraScreen'
>;

interface CapturedPhoto {
  uri: string;
  width?: number;
  height?: number;
  fileSize?: number;
  type?: string;
  fileName?: string;
}

const CameraScreen: React.FC = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const route = useRoute<CameraScreenRouteProp>();
  const { fridgeId } = route.params;

  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const cameraOptions = {
    mediaType: 'photo' as MediaType,
    includeBase64: false,
    maxHeight: 3000,
    maxWidth: 2000,
    quality: 0.8 as PhotoQuality,
    saveToPhotos: false,
    cameraType: 'back' as const,
    presentationStyle: 'fullScreen' as const,
  };

  const handleCameraResponse = useCallback((response: ImagePickerResponse) => {
    setIsLoading(false);

    if (response.didCancel) {
      console.log('User canceled camera');
      return;
    }

    if (response.errorMessage) {
      console.error('Camera Error:', response.errorMessage);
      Alert.alert('오류', '카메라를 실행할 수 없습니다.');
      return;
    }

    if (response.assets?.[0]) {
      const asset = response.assets[0];
      const photo: CapturedPhoto = {
        uri: asset.uri!,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
        type: asset.type,
        fileName: asset.fileName,
      };
      setCapturedPhoto(photo);
    }
  }, []);

  const openCamera = useCallback(() => {
    setIsLoading(true);
    launchCamera(cameraOptions, handleCameraResponse);
  }, [handleCameraResponse]);

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
    openCamera();
  }, [openCamera]);

  const cancelPhoto = useCallback(() => {
    const alertTitle = capturedPhoto
      ? '취소하시겠습니까?'
      : '촬영을 종료하시겠습니까?';
    const alertMessage = capturedPhoto
      ? '촬영한 사진이 삭제됩니다.'
      : '카메라 화면을 나가시겠습니까?';

    Alert.alert(alertTitle, alertMessage, [
      { text: '계속 촬영', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => {
          setCapturedPhoto(null);
          navigation.goBack();
        },
      },
    ]);
  }, [capturedPhoto, navigation]);

  const usePhoto = useCallback(() => {
    if (!capturedPhoto) return;

    navigation.navigate('AddItemScreen', {
      fridgeId,
      recognizedData: {
        photo: capturedPhoto.uri,
        name: '인식된 식재료',
        quantity: '1',
        unit: '개',
        expirationDate: '',
        storageType: '냉장',
        itemCategory: '야채',
      },
    });
  }, [capturedPhoto, fridgeId, navigation]);

  const handlePhotoUpdate = useCallback((updatedPhoto: CapturedPhoto) => {
    setCapturedPhoto(updatedPhoto);
  }, []);

  const handleAdditionalPhoto = useCallback((newPhoto: CapturedPhoto) => {
    console.log('New additional photo:', newPhoto);
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (isLoading) {
          setIsLoading(false);
        }
      };
    }, [isLoading]),
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#fff" />
          <CustomText style={styles.cameraButtonText}>
            카메라 실행 중...
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {capturedPhoto ? (
        <PhotoPreview
          photo={capturedPhoto}
          onRetake={retakePhoto}
          onUse={usePhoto}
          onCancel={cancelPhoto}
          onPhotoUpdate={handlePhotoUpdate}
          onAdditionalPhoto={handleAdditionalPhoto}
        />
      ) : (
        <View style={styles.cameraLaunchContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={cancelPhoto}
              accessibilityLabel="닫기"
              accessibilityRole="button"
            >
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <CustomText style={styles.headerTitle}>식재료 촬영</CustomText>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.centerContent}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={openCamera}
              disabled={isLoading}
              accessibilityLabel="카메라로 촬영하기"
              accessibilityRole="button"
            >
              <MaterialIcons name="camera-alt" size={48} color="#fff" />
            </TouchableOpacity>
            <CustomText style={styles.cameraButtonText}>
              카메라로 촬영하기
            </CustomText>
          </View>

          <View style={styles.bottomGuide}>
            <CustomText style={styles.guideText}>
              식재료를 카메라로 촬영해주세요
            </CustomText>
            <CustomText style={styles.subGuideText}>
              명확한 사진일수록 정확한 인식이 가능합니다
            </CustomText>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CameraScreen;
