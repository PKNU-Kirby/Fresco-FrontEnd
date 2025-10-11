import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  Text,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
  ScrollView,
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
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
  PhotoQuality,
} from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { cameraStyles as styles } from './styles';
import {
  IngredientControllerAPI,
  ConfirmedIngredient,
} from '../../services/API/ingredientControllerAPI';

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

// 개발용 목업 이미지 URI
const MOCK_INGREDIENT_IMAGE = require('../../../grocery1.jpg');
const MOCK_RECEIPT_IMAGE = require('../../../reciept1.jpg');

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

  // 개발 모드 체크
  const isDevelopment = __DEV__;

  const handleCameraResponse = useCallback((response: ImagePickerResponse) => {
    setIsLoading(false);

    if (response.didCancel) {
      console.log('User canceled camera');
      setScanMode(null);
      return;
    }

    if (response.errorMessage) {
      console.error('Camera Error:', response.errorMessage);
      Alert.alert(
        '카메라 오류',
        '카메라를 실행할 수 없습니다. 다시 시도해주세요.',
        [{ text: '확인', onPress: () => setScanMode(null) }],
      );
      return;
    }

    if (response.assets?.[0]) {
      const asset = response.assets[0];

      if (!asset.uri) {
        Alert.alert('오류', '이미지를 가져올 수 없습니다.');
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

      console.log('촬영 완료:', {
        uri: photo.uri,
        size: photo.fileSize
          ? `${(photo.fileSize / 1024 / 1024).toFixed(2)}MB`
          : 'Unknown',
        dimensions: `${photo.width}x${photo.height}`,
      });

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
          Alert.alert(
            '권한 필요',
            '카메라 권한을 허용해야 촬영할 수 있습니다.\n설정에서 권한을 변경할 수 있습니다.',
            [{ text: '취소', onPress: () => setScanMode(null) }],
          );
          return;
        }
      } catch (err) {
        console.warn('권한 요청 오류:', err);
        return;
      }
    }

    const modeSpecificOptions = {
      ...cameraOptions,
      quality: scanMode === 'receipt' ? 0.9 : 0.8,
      maxHeight: scanMode === 'receipt' ? 4000 : 3000,
      maxWidth: scanMode === 'receipt' ? 3000 : 2000,
    };

    console.log(`${scanMode} 모드로 카메라 실행:`, modeSpecificOptions);

    setIsLoading(true);
    launchCamera(modeSpecificOptions, handleCameraResponse);
  }, [scanMode, handleCameraResponse]);

  const cancelPhoto = useCallback(() => {
    if (capturedPhoto) {
      Alert.alert('사진 삭제', '촬영한 사진을 삭제하고 나가시겠습니까?', [
        { text: '계속 진행', style: 'cancel' },
        {
          text: '삭제하고 나가기',
          style: 'destructive',
          onPress: () => {
            setCapturedPhoto(null);
            setScanMode(null);
            navigation.goBack();
          },
        },
      ]);
    } else if (scanMode) {
      Alert.alert('촬영 취소', '촬영을 취소하고 나가시겠습니까?', [
        { text: '계속 촬영', style: 'cancel' },
        {
          text: '나가기',
          onPress: () => {
            setScanMode(null);
            navigation.goBack();
          },
        },
      ]);
    } else {
      navigation.goBack();
    }
  }, [capturedPhoto, scanMode, navigation]);

  const navigateToPreview = useCallback(() => {
    if (!capturedPhoto || !scanMode) {
      console.error('촬영된 사진 또는 스캔 모드가 없습니다', {
        capturedPhoto,
        scanMode,
      });
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
      console.log(`촬영 모드 선택: ${mode}`);
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

  // FormData 검증 테스트
  // CameraScreen.tsx에서 testFormDataValidation 메서드만 수정하면 됩니다

  const testFormDataValidation = useCallback(async () => {
    try {
      Alert.alert(
        'FormData 검증 테스트',
        '갤러리에서 이미지를 선택해서 서버 전송을 상세 분석합니다.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '갤러리 선택',
            onPress: () => {
              launchImageLibrary(
                { mediaType: 'photo', quality: 0.8 },
                async response => {
                  if (response.assets?.[0]?.uri) {
                    setIsLoading(true);
                    try {
                      console.log('=== FormData 검증 테스트 시작 ===');
                      const imageUri = response.assets[0].uri;

                      // ✅ fridgeId를 포함한 새로운 검증 메서드 사용
                      await IngredientControllerAPI.validateFormDataTransmissionWithFridgeId(
                        imageUri,
                        fridgeId,
                      );
                      await IngredientControllerAPI.validateServerParametersWithFridgeId(
                        fridgeId,
                      );
                      await IngredientControllerAPI.compareRealVsDummyImageWithFridgeId(
                        imageUri,
                        fridgeId,
                      );

                      Alert.alert(
                        '검증 완료',
                        'FormData 검증이 완료되었습니다.\n콘솔에서 상세 로그를 확인하세요.',
                      );
                    } catch (error) {
                      console.error('FormData 검증 실패:', error);
                      Alert.alert('검증 오류', `오류: ${error.message}`);
                    } finally {
                      setIsLoading(false);
                    }
                  }
                },
              );
            },
          },
        ],
      );
    } catch (error) {
      console.error('FormData 검증 준비 실패:', error);
    }
  }, [fridgeId]); // fridgeId 의존성 추가
  // 목업 테스트
  const testWithMockData = useCallback(
    (mode: 'ingredient' | 'receipt') => {
      try {
        const mockPhoto = {
          uri:
            mode === 'ingredient' ? MOCK_INGREDIENT_IMAGE : MOCK_RECEIPT_IMAGE,
          width: 1000,
          height: 1000,
          fileSize: 500000,
          type: 'image/jpeg',
          fileName: `mock_${mode}.jpg`,
        };

        navigation.navigate('PhotoPreview', {
          photo: mockPhoto,
          fridgeId,
          scanMode: mode,
        });
      } catch (error) {
        console.error('목업 테스트 에러:', error);
        Alert.alert(
          '오류',
          `목업 테스트 중 오류가 발생했습니다: ${error.message}`,
        );
      }
    },
    [fridgeId, navigation],
  );

  // CameraScreen.tsx에 추가할 긴급 해결 메서드

  const handleEmergencyWorkaround = useCallback(() => {
    Alert.alert(
      '서버 문제 감지',
      '현재 서버에서 500 오류가 발생하고 있습니다.\n임시 해결책을 선택해주세요.',
      [
        {
          text: '목업 데이터로 테스트',
          onPress: () => {
            // 목업 데이터로 바로 AddItemScreen으로 이동
            const mockConfirmedIngredients: ConfirmedIngredient[] = [
              {
                userInput: {
                  id: 'mock_1',
                  name: '토마토',
                  quantity: '2',
                  unit: '개',
                  expirationDate: '2025-10-01',
                  itemCategory: '채소 / 과일',
                  photo: undefined,
                },
                apiResult: {
                  ingredientId: 123,
                  ingredientName: '토마토',
                  categoryId: 2,
                  categoryName: '채소 / 과일',
                },
              },
              {
                userInput: {
                  id: 'mock_2',
                  name: '우유',
                  quantity: '1',
                  unit: '개',
                  expirationDate: '2025-09-25',
                  itemCategory: '우유 / 유제품',
                  photo: undefined,
                },
                apiResult: {
                  ingredientId: 456,
                  ingredientName: '우유',
                  categoryId: 8,
                  categoryName: '우유 / 유제품',
                },
              },
            ];

            navigation.navigate('AddItemScreen', {
              fridgeId,
              scanResults: mockConfirmedIngredients,
              scanMode: 'ingredient',
              isEmergencyMode: true,
            });
          },
        },
        {
          text: '수동 입력으로 진행',
          onPress: () => {
            navigation.navigate('AddItemScreen', {
              fridgeId,
              recognizedData: {
                photo: undefined,
                name: '',
                quantity: '1',
                unit: '개',
                expiryDate: '',
                itemCategory: '기타',
              },
              isManualInput: true,
            });
          },
        },
        {
          text: '나중에 시도',
          style: 'cancel',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  }, [fridgeId, navigation]);

  // 기존 모드 선택 화면에 긴급 버튼 추가
  const EmergencyButton = () => (
    <TouchableOpacity
      style={[styles.modeButton, { backgroundColor: '#ffebee' }]}
      onPress={handleEmergencyWorkaround}
      disabled={isLoading}
    >
      <View style={[styles.modeIconContainer, { backgroundColor: '#f44336' }]}>
        <MaterialIcons name="warning" size={48} color="#fff" />
      </View>
      <Text style={[styles.modeTitle, { color: '#c62828' }]}>
        서버 문제 해결
      </Text>
      <Text style={[styles.modeDescription, { color: '#c62828' }]}>
        500 오류 발생 시{'\n'}임시 해결책 사용
      </Text>
    </TouchableOpacity>
  );
  // 모드 선택 화면
  if (!scanMode) {
    return (
      <SafeAreaView style={styles.container}>
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
              {/* 기본 카메라 촬영 옵션들 */}
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
                <Text style={styles.modeTitle}>영수증 스캔</Text>
                <Text style={styles.modeDescription}>
                  영수증을 촬영하여 여러 식재료를{'\n'}한 번에 등록합니다
                </Text>
              </TouchableOpacity>
            </View>

            {/* 로딩 상태 표시 */}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#f8f8f8" />
                <Text style={styles.loadingText}>처리 중...</Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 기존 카메라 화면 로직
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
    </SafeAreaView>
  );
};

export default CameraScreen;
