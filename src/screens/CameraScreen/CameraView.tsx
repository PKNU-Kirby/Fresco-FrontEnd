// screens/CameraScreen/CameraView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  launchCamera,
  ImagePickerResponse,
  MediaType,
  PhotoQuality,
} from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../components/common/CustomText';
import { cameraViewStyles as styles } from './styles';

type RootStackParamList = {
  CameraView: {
    onPhotoCapture: (photoUri: string) => void;
  };
};

type CameraViewRouteProp = RouteProp<RootStackParamList, 'CameraView'>;
type CameraViewNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CameraView'
>;

type CameraType = 'back' | 'front';
type FlashMode = 'off' | 'on' | 'auto';

interface CameraSettings {
  cameraType: CameraType;
  flashMode: FlashMode;
  photoQuality: PhotoQuality;
}

interface QualityOption {
  quality: PhotoQuality;
  label: string;
  description: string;
}

const CameraView: React.FC = () => {
  const navigation = useNavigation<CameraViewNavigationProp>();
  const route = useRoute<CameraViewRouteProp>();
  const { onPhotoCapture } = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<CameraSettings>({
    cameraType: 'back',
    flashMode: 'auto',
    photoQuality: 0.8,
  });

  const qualityOptions: QualityOption[] = [
    { quality: 0.5, label: '기본', description: '빠른 처리' },
    { quality: 0.8, label: '고화질', description: '권장' },
    { quality: 1.0, label: '최고', description: '용량 큼' },
  ];

  const getFlashIcon = useCallback((mode: FlashMode): string => {
    switch (mode) {
      case 'on':
        return 'flash-on';
      case 'auto':
        return 'flash-auto';
      default:
        return 'flash-off';
    }
  }, []);

  const getFlashLabel = useCallback((mode: FlashMode): string => {
    switch (mode) {
      case 'on':
        return '켜짐';
      case 'auto':
        return '자동';
      default:
        return '꺼짐';
    }
  }, []);

  const getCameraOptions = useCallback(
    () => ({
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 3000,
      maxWidth: 2000,
      quality: settings.photoQuality,
      saveToPhotos: false,
      cameraType: settings.cameraType,
      presentationStyle: 'fullScreen' as const,
    }),
    [settings],
  );

  const handleCameraResponse = useCallback((response: ImagePickerResponse) => {
    setIsLoading(false);

    if (response.didCancel) {
      console.log('User canceled additional camera');
      return;
    }

    if (response.errorMessage) {
      console.error('Additional Camera Error:', response.errorMessage);
      Alert.alert('오류', '카메라를 실행할 수 없습니다.');
      return;
    }

    if (response.assets?.[0]?.uri) {
      handlePhotoSuccess(response.assets[0].uri);
    }
  }, []);

  const openCamera = useCallback(() => {
    setIsLoading(true);
    const options = getCameraOptions();
    launchCamera(options, handleCameraResponse);
  }, [getCameraOptions, handleCameraResponse]);

  const handlePhotoSuccess = useCallback(
    (photoUri: string) => {
      Alert.alert('촬영 완료', '추가 사진이 촬영되었습니다.', [
        {
          text: '다시 촬영',
          onPress: openCamera,
        },
        {
          text: '사용하기',
          onPress: () => {
            (navigation as any).navigate('PhotoPreview', {
              additionalPhotoUri: photoUri,
            });
          },
        },
      ]);
    },
    [navigation, openCamera],
  );

  const toggleCameraType = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      cameraType: prev.cameraType === 'back' ? 'front' : 'back',
    }));
  }, []);

  const toggleFlashMode = useCallback(() => {
    setSettings(prev => {
      const modes: FlashMode[] = ['off', 'on', 'auto'];
      const currentIndex = modes.indexOf(prev.flashMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      return {
        ...prev,
        flashMode: modes[nextIndex],
      };
    });
  }, []);

  const changeQuality = useCallback((quality: PhotoQuality) => {
    setSettings(prev => ({
      ...prev,
      photoQuality: quality,
    }));
  }, []);

  const handleCancel = useCallback(() => {
    Alert.alert('촬영 취소', '추가 촬영을 종료하시겠습니까?', [
      { text: '계속 촬영', style: 'cancel' },
      {
        text: '종료',
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(openCamera, 500);
    return () => clearTimeout(timer);
  }, [openCamera]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <CustomText style={styles.loadingText}>
            카메라를 실행하는 중...
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          accessibilityLabel="촬영 취소"
          accessibilityRole="button"
        >
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>추가 촬영</CustomText>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleFlashMode}
            accessibilityLabel={`플래시 모드: ${getFlashLabel(
              settings.flashMode,
            )}`}
            accessibilityRole="button"
          >
            <MaterialIcons
              name={getFlashIcon(settings.flashMode)}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.instructionContainer}>
          <CustomText style={styles.instructionTitle}>
            📸 추가 사진 촬영
          </CustomText>
          <CustomText style={styles.instructionText}>
            식재료의 다른 각도나 추가 정보를 담은 사진을 촬영해주세요
          </CustomText>
        </View>

        <View style={styles.settingsContainer}>
          <CustomText style={styles.settingsTitle}>카메라 설정</CustomText>

          <View style={styles.settingItem}>
            <CustomText style={styles.settingLabel}>카메라</CustomText>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={toggleCameraType}
              accessibilityLabel={`카메라 전환: 현재 ${
                settings.cameraType === 'back' ? '후면' : '전면'
              }`}
              accessibilityRole="button"
            >
              <MaterialIcons
                name={
                  settings.cameraType === 'back'
                    ? 'camera-rear'
                    : 'camera-front'
                }
                size={20}
                color="#007AFF"
              />
              <CustomText style={styles.settingButtonText}>
                {settings.cameraType === 'back' ? '후면' : '전면'}
              </CustomText>
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <CustomText style={styles.settingLabel}>플래시</CustomText>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={toggleFlashMode}
              accessibilityLabel={`플래시 모드: ${getFlashLabel(
                settings.flashMode,
              )}`}
              accessibilityRole="button"
            >
              <MaterialIcons
                name={getFlashIcon(settings.flashMode)}
                size={20}
                color="#007AFF"
              />
              <CustomText style={styles.settingButtonText}>
                {getFlashLabel(settings.flashMode)}
              </CustomText>
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <CustomText style={styles.settingLabel}>화질</CustomText>
            <View style={styles.qualityButtons}>
              {qualityOptions.map(({ quality, label, description }) => (
                <TouchableOpacity
                  key={quality}
                  style={[
                    styles.qualityButton,
                    settings.photoQuality === quality &&
                      styles.qualityButtonActive,
                  ]}
                  onPress={() => changeQuality(quality)}
                  accessibilityLabel={`화질 설정: ${label} (${description})`}
                  accessibilityRole="button"
                >
                  <CustomText
                    style={[
                      styles.qualityButtonText,
                      settings.photoQuality === quality &&
                        styles.qualityButtonTextActive,
                    ]}
                  >
                    {label}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.cameraButtonContainer}>
          <TouchableOpacity
            style={[
              styles.cameraButton,
              isLoading && styles.cameraButtonDisabled,
            ]}
            onPress={openCamera}
            disabled={isLoading}
            accessibilityLabel="추가 촬영하기"
            accessibilityRole="button"
          >
            <MaterialIcons
              name="camera-alt"
              size={48}
              color={isLoading ? '#666' : '#fff'}
            />
          </TouchableOpacity>
          <CustomText style={styles.cameraButtonText}>
            {isLoading ? '카메라 실행 중...' : '추가 촬영하기'}
          </CustomText>
        </View>
      </View>

      <View style={styles.bottomGuide}>
        <CustomText style={styles.guideText}>
          💡 팁: 여러 각도에서 촬영하면 더 정확한 식재료 인식이 가능합니다
        </CustomText>
      </View>
    </SafeAreaView>
  );
};

export default CameraView;
