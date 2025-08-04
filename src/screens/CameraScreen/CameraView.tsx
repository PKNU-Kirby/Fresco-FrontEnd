import React, { useState, useEffect } from 'react';
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

// Navigation 타입
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CameraView: React.FC = () => {
  const navigation = useNavigation<CameraViewNavigationProp>();
  const route = useRoute<CameraViewRouteProp>();
  const { onPhotoCapture } = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('auto');
  const [photoQuality, setPhotoQuality] = useState<PhotoQuality>(0.8);

  // 카메라 실행
  const openCamera = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 3000,
      maxWidth: 2000,
      quality: photoQuality,
      saveToPhotos: false,
      cameraType: cameraType,
      presentationStyle: 'fullScreen' as const,
    };

    setIsLoading(true);

    launchCamera(options, (response: ImagePickerResponse) => {
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

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        handlePhotoSuccess(asset.uri!);
      }
    });
  };

  // 촬영 성공 처리
  const handlePhotoSuccess = (photoUri: string) => {
    Alert.alert('촬영 완료', '추가 사진이 촬영되었습니다.', [
      {
        text: '다시 촬영',
        onPress: () => openCamera(),
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
  };

  // 카메라 타입 변경
  const toggleCameraType = () => {
    setCameraType(prev => (prev === 'back' ? 'front' : 'back'));
  };

  // 플래시 모드 변경
  const toggleFlashMode = () => {
    const modes: Array<'off' | 'on' | 'auto'> = ['off', 'on', 'auto'];
    const currentIndex = modes.indexOf(flashMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setFlashMode(modes[nextIndex]);
  };

  // 화질 변경
  const changeQuality = (quality: PhotoQuality) => {
    setPhotoQuality(quality);
  };

  // 취소 처리
  const handleCancel = () => {
    Alert.alert('촬영 취소', '추가 촬영을 종료하시겠습니까?', [
      { text: '계속 촬영', style: 'cancel' },
      {
        text: '종료',
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  // 자동 촬영 시작 (화면 진입 시)
  useEffect(() => {
    // 약간의 딜레이 후 자동으로 카메라 실행
    const timer = setTimeout(() => {
      openCamera();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>추가 촬영</CustomText>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleFlashMode}
          >
            <MaterialIcons
              name={
                flashMode === 'on'
                  ? 'flash-on'
                  : flashMode === 'auto'
                  ? 'flash-auto'
                  : 'flash-off'
              }
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.instructionContainer}>
          <CustomText style={styles.instructionTitle}>
            📸 추가 사진 촬영
          </CustomText>
          <CustomText style={styles.instructionText}>
            식재료의 다른 각도나 추가 정보를 담은 사진을 촬영해주세요
          </CustomText>
        </View>

        {/* Camera Settings */}
        <View style={styles.settingsContainer}>
          <CustomText style={styles.settingsTitle}>카메라 설정</CustomText>

          {/* Camera Type */}
          <View style={styles.settingItem}>
            <CustomText style={styles.settingLabel}>카메라</CustomText>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={toggleCameraType}
            >
              <MaterialIcons
                name={cameraType === 'back' ? 'camera-rear' : 'camera-front'}
                size={20}
                color="#007AFF"
              />
              <CustomText style={styles.settingButtonText}>
                {cameraType === 'back' ? '후면' : '전면'}
              </CustomText>
            </TouchableOpacity>
          </View>

          {/* Flash Mode */}
          <View style={styles.settingItem}>
            <CustomText style={styles.settingLabel}>플래시</CustomText>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={toggleFlashMode}
            >
              <MaterialIcons
                name={
                  flashMode === 'on'
                    ? 'flash-on'
                    : flashMode === 'auto'
                    ? 'flash-auto'
                    : 'flash-off'
                }
                size={20}
                color="#007AFF"
              />
              <CustomText style={styles.settingButtonText}>
                {flashMode === 'on'
                  ? '켜짐'
                  : flashMode === 'auto'
                  ? '자동'
                  : '꺼짐'}
              </CustomText>
            </TouchableOpacity>
          </View>

          {/* Quality */}
          <View style={styles.settingItem}>
            <CustomText style={styles.settingLabel}>화질</CustomText>
            <View style={styles.qualityButtons}>
              {[
                { quality: 0.5 as PhotoQuality, label: '기본' },
                { quality: 0.8 as PhotoQuality, label: '고화질' },
                { quality: 1.0 as PhotoQuality, label: '최고' },
              ].map(({ quality, label }) => (
                <TouchableOpacity
                  key={quality}
                  style={[
                    styles.qualityButton,
                    photoQuality === quality && styles.qualityButtonActive,
                  ]}
                  onPress={() => changeQuality(quality)}
                >
                  <CustomText
                    style={[
                      styles.qualityButtonText,
                      photoQuality === quality &&
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

        {/* Main Camera Button */}
        <View style={styles.cameraButtonContainer}>
          <TouchableOpacity
            style={[
              styles.cameraButton,
              isLoading && styles.cameraButtonDisabled,
            ]}
            onPress={openCamera}
            disabled={isLoading}
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

      {/* Bottom Guide */}
      <View style={styles.bottomGuide}>
        <CustomText style={styles.guideText}>
          💡 팁: 여러 각도에서 촬영하면 더 정확한 식재료 인식이 가능합니다
        </CustomText>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  cancelButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
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
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionText: {
    color: '#ccc',
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
    color: '#fff',
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
    color: '#fff',
    fontSize: 16,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  settingButtonText: {
    color: '#007AFF',
    fontSize: 14,
    marginLeft: 6,
  },
  qualityButtons: {
    flexDirection: 'row',
  },
  qualityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  qualityButtonActive: {
    backgroundColor: '#007AFF',
  },
  qualityButtonText: {
    color: '#ccc',
    fontSize: 12,
  },
  qualityButtonTextActive: {
    color: '#fff',
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
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cameraButtonDisabled: {
    backgroundColor: '#666',
    shadowOpacity: 0,
    elevation: 0,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomGuide: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  guideText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CameraView;
