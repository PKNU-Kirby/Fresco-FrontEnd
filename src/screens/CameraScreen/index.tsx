import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  launchCamera,
  ImagePickerResponse,
  MediaType,
  PhotoQuality,
} from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../../App';
import ConfirmModal from '../../components/modals/ConfirmModal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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
  const [scanMode, setScanMode] = useState<'ingredient' | 'receipt' | null>(
    null,
  );

  // 모달 상태 관리
  const [cameraErrorModalVisible, setCameraErrorModalVisible] = useState(false);
  const [imageErrorModalVisible, setImageErrorModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [deletePhotoModalVisible, setDeletePhotoModalVisible] = useState(false);
  const [cancelScanModalVisible, setCancelScanModalVisible] = useState(false);

  const handleCameraResponse = useCallback((response: ImagePickerResponse) => {
    setIsLoading(false);

    if (response.didCancel) {
      // console.log('User canceled camera');
      setScanMode(null);
      return;
    }

    if (response.errorMessage) {
      // console.error('Camera Error:', response.errorMessage);
      setCameraErrorModalVisible(true);
      return;
    }

    if (response.assets?.[0]) {
      const asset = response.assets[0];

      if (!asset.uri) {
        setImageErrorModalVisible(true);
        setScanMode(null);
        return;
      }

      const photo: CapturedPhoto = {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
        type: asset.type,
        fileName: asset.fileName,
      };

      /*
      console.log('촬영 완료:', {
        uri: photo.uri,
        size: photo.fileSize
          ? `${(photo.fileSize / 1024 / 1024).toFixed(2)}MB`
          : 'Unknown',
        dimensions: `${photo.width}x${photo.height}`,
      });
      */

      setCapturedPhoto(photo);
    }
  }, []);

  const openCamera = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: '카메라 권한 필요',
            message: `${
              scanMode === 'ingredient' ? '식재료' : '영수증'
            } 촬영을 위해 카메라 권한이 필요합니다.`,
            buttonNeutral: '나중에',
            buttonNegative: '거부',
            buttonPositive: '허용',
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionModalVisible(true);
          return;
        }
      } catch (err) {
        // console.warn('권한 요청 오류:', err);
        return;
      }
    }

    const modeSpecificOptions = {
      ...cameraOptions,
      quality: scanMode === 'receipt' ? 0.9 : 0.8,
      maxHeight: scanMode === 'receipt' ? 4000 : 3000,
      maxWidth: scanMode === 'receipt' ? 3000 : 2000,
    };

    // console.log(`${scanMode} 모드로 카메라 실행:`, modeSpecificOptions);

    setIsLoading(true);
    launchCamera(modeSpecificOptions, handleCameraResponse);
  }, [scanMode, handleCameraResponse]);

  const cancelPhoto = useCallback(() => {
    if (capturedPhoto) {
      setDeletePhotoModalVisible(true);
    } else if (scanMode) {
      setCancelScanModalVisible(true);
    } else {
      navigation.goBack();
    }
  }, [capturedPhoto, scanMode, navigation]);

  const navigateToPreview = useCallback(() => {
    if (!capturedPhoto || !scanMode) {
      /*
      console.error('촬영된 사진 또는 스캔 모드가 없습니다', {
        capturedPhoto,
        scanMode,
      });*/
      return;
    }

    navigation.navigate('PhotoPreview', {
      photo: capturedPhoto,
      fridgeId,
      scanMode,
    });
  }, [capturedPhoto, fridgeId, scanMode, navigation]);

  const handleModeSelect = useCallback(
    (mode: 'ingredient' | 'receipt') => {
      // console.log(`촬영 모드 선택: ${mode}`);
      setScanMode(mode);

      setTimeout(() => {
        openCamera();
      }, 100);
    },
    [openCamera],
  );

  useEffect(() => {
    if (capturedPhoto && scanMode) {
      setTimeout(() => {
        navigateToPreview();
      }, 300);
    }
  }, [capturedPhoto, scanMode, navigateToPreview]);

  if (!scanMode) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.modeSelectionContainer}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
              >
                <MaterialIcons
                  name="arrow-back-ios-new"
                  size={24}
                  color="#f8f8f8"
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>촬영 방식 선택</Text>
              <View style={styles.rightHeader} />
            </View>

            <View style={styles.modeOptions}>
              <TouchableOpacity
                style={styles.modeButton}
                onPress={() => handleModeSelect('ingredient')}
                disabled={isLoading}
              >
                <View
                  style={[
                    styles.modeIconContainer,
                    { backgroundColor: '#f8f8f8' },
                  ]}
                >
                  <MaterialIcons name="eco" size={48} color="#444" />
                </View>
                <Text style={styles.modeTitle}>식재료 촬영</Text>
                <Text style={styles.modeDescription}>
                  식재료 사진을 촬영하여{'\n'}정보를 자동 인식합니다
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modeButton}
                onPress={() => handleModeSelect('receipt')}
                disabled={isLoading}
              >
                <View
                  style={[
                    styles.modeIconContainer,
                    { backgroundColor: '#f8f8f8' },
                  ]}
                >
                  <MaterialIcons name="receipt" size={48} color="#444" />
                </View>
                <Text style={styles.modeTitle}>영수증 촬영</Text>
                <Text style={styles.modeDescription}>
                  영수증을 촬영하여 여러 식재료를{'\n'}한 번에 등록합니다
                </Text>
              </TouchableOpacity>
            </View>

            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#f8f8f8" />
                <Text style={styles.loadingText}>처리 중...</Text>
              </View>
            )}
          </View>
        </View>

        {/* Modals */}
        <ConfirmModal
          isAlert={false}
          visible={cameraErrorModalVisible}
          title="카메라 오류"
          message="카메라를 실행할 수 없습니다. 다시 시도해주세요."
          iconContainer={{ backgroundColor: '#FFE5E5' }}
          icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="danger"
          onConfirm={() => {
            setCameraErrorModalVisible(false);
            setScanMode(null);
          }}
          onCancel={() => {
            setCameraErrorModalVisible(false);
            setScanMode(null);
          }}
        />

        <ConfirmModal
          isAlert={false}
          visible={imageErrorModalVisible}
          title="오류"
          message="이미지를 가져올 수 없습니다."
          iconContainer={{ backgroundColor: '#FFE5E5' }}
          icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="danger"
          onConfirm={() => setImageErrorModalVisible(false)}
          onCancel={() => setImageErrorModalVisible(false)}
        />

        <ConfirmModal
          isAlert={false}
          visible={permissionModalVisible}
          title="권한 필요"
          message="카메라 권한을 허용해 주세요.\n설정에서 권한을 변경할 수 있습니다."
          iconContainer={{ backgroundColor: '#e8f5e9' }}
          icon={{
            name: 'error-outline',
            color: 'rgba(47, 72, 88, 1)',
            size: 48,
          }}
          confirmText="확인"
          cancelText=""
          confirmButtonStyle="general"
          onConfirm={() => {
            setPermissionModalVisible(false);
            setScanMode(null);
          }}
          onCancel={() => {
            setPermissionModalVisible(false);
            setScanMode(null);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          <Text style={styles.headerTitle}>
            {scanMode === 'ingredient' ? '식재료 촬영' : '영수증 촬영'}
          </Text>
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
          <Text style={styles.cameraButtonText}>
            {isLoading ? '카메라 준비 중...' : '카메라로 촬영하기'}
          </Text>
        </View>

        <View style={styles.bottomGuide}>
          <Text style={styles.guideText}>
            {scanMode === 'ingredient'
              ? '식재료를 화면 중앙에 놓고 명확하게 촬영해주세요.\n조명이 밝은 곳에서 촬영하면 더 정확합니다.'
              : '영수증 전체가 화면에 들어오도록 촬영해주세요.\n글자가 선명하게 보이도록 초점을 맞춰주세요.'}
          </Text>
        </View>
      </View>

      {/* Camera Screen Modal */}
      <ConfirmModal
        isAlert={true}
        visible={deletePhotoModalVisible}
        title="촬영 취소"
        message="촬영한 사진을 삭제하고 나가시겠습니까?"
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="나가기"
        cancelText="계속 진행"
        confirmButtonStyle="danger"
        onConfirm={() => {
          setDeletePhotoModalVisible(false);
          setCapturedPhoto(null);
          setScanMode(null);
          navigation.goBack();
        }}
        onCancel={() => setDeletePhotoModalVisible(false)}
      />

      <ConfirmModal
        isAlert={true}
        visible={cancelScanModalVisible}
        title="촬영 취소"
        message="촬영을 취소하고 나가시겠습니까?"
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="나가기"
        cancelText="계속 촬영"
        confirmButtonStyle="danger"
        onConfirm={() => {
          setCancelScanModalVisible(false);
          setScanMode(null);
          navigation.goBack();
        }}
        onCancel={() => setCancelScanModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default CameraScreen;
