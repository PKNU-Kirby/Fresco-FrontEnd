import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  Text,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
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

const CameraScreen: React.FC = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const route = useRoute<CameraScreenRouteProp>();
  const { fridgeId } = route.params;

  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

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

  const openCamera = useCallback(async () => {
    // Android 권한 체크
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: '카메라 권한',
            message: '식재료 촬영을 위해 카메라 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '확인',
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    setIsLoading(true);
    launchCamera(cameraOptions, handleCameraResponse);
  }, [handleCameraResponse]);

  const cancelPhoto = useCallback(() => {
    const alertTitle = capturedPhoto
      ? '사진 등록을 취소합니다.'
      : '촬영을 종료합니다.';
    const alertMessage = capturedPhoto
      ? '촬영한 사진이 삭제됩니다.'
      : '카메라 화면을 나가시겠습니까?';

    Alert.alert(alertTitle, alertMessage, [
      { text: '취소', style: 'cancel' },
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

  const navigateToPreview = useCallback(() => {
    if (!capturedPhoto) return;

    navigation.navigate('PhotoPreview', {
      photo: capturedPhoto,
      fridgeId,
    });
  }, [capturedPhoto, fridgeId, navigation]);

  useEffect(() => {
    if (capturedPhoto) {
      navigateToPreview();
    }
  }, [capturedPhoto, navigateToPreview]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (isLoading) {
          setIsLoading(false);
        }
      };
    }, [isLoading]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraLaunchContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={cancelPhoto}
            accessibilityLabel="닫기"
            accessibilityRole="button"
          >
            <MaterialIcons
              name="arrow-back-ios-new"
              size={24}
              color="#f8f8f8"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>식재료 촬영</Text>
          <View style={styles.rightHeader} />
        </View>

        <View style={styles.centerContent}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={openCamera}
            disabled={isLoading}
            accessibilityLabel="카메라로 촬영하기"
            accessibilityRole="button"
          >
            <MaterialIcons name="camera-alt" size={48} color="#f8f8f8" />
          </TouchableOpacity>
          <Text style={styles.cameraButtonText}>카메라로 촬영하기</Text>
        </View>

        <View style={styles.bottomGuide}>
          <Text style={styles.guideText}>식재료를 카메라로 촬영해주세요</Text>
          <Text style={styles.subGuideText}>
            명확한 사진일수록 정확한 인식이 가능합니다
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CameraScreen;
