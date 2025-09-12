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

    // 스캔 모드별 카메라 옵션 조정
    const modeSpecificOptions = {
      ...cameraOptions,
      // 영수증 스캔시에는 더 높은 품질로 설정
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
      scanMode, // scanMode 전달
    });
  }, [capturedPhoto, fridgeId, scanMode, navigation]);

  const handleModeSelect = useCallback(
    (mode: 'ingredient' | 'receipt') => {
      console.log(`촬영 모드 선택: ${mode}`);
      setScanMode(mode);

      // 모드 선택 후 바로 카메라 실행
      setTimeout(() => {
        openCamera();
      }, 100);
    },
    [openCamera],
  );

  // 사진 촬영 완료 시 자동 이동
  useEffect(() => {
    if (capturedPhoto && scanMode) {
      setTimeout(() => {
        navigateToPreview();
      }, 300);
    }
  }, [capturedPhoto, scanMode, navigateToPreview]);

  // ========== 목업 데이터 테스트 (FormData 우회) ==========

  // CameraScreen.tsx의 목업 테스트 수정
  const testWithMockData = useCallback(
    (mode: 'ingredient' | 'receipt') => {
      try {
        // 목업 사진 객체 생성
        const mockPhoto = {
          uri:
            mode === 'ingredient' ? MOCK_INGREDIENT_IMAGE : MOCK_RECEIPT_IMAGE,
          width: 1000,
          height: 1000,
          fileSize: 500000,
          type: 'image/jpeg',
          fileName: `mock_${mode}.jpg`,
        };

        // PhotoPreview로 이동 (정상 플로우)
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
  const testAutoCompleteOnly = useCallback(async () => {
    try {
      const testKeywords = ['토마토', '우유', '식빵', '바나나', '오이'];
      const randomKeyword =
        testKeywords[Math.floor(Math.random() * testKeywords.length)];

      Alert.alert(
        'Auto Complete API 테스트',
        `"${randomKeyword}"로 자동완성 API를 테스트하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '테스트',
            onPress: async () => {
              setIsLoading(true);
              try {
                console.log(`Auto Complete API 테스트: "${randomKeyword}"`);

                const results = await IngredientControllerAPI.searchIngredients(
                  randomKeyword,
                );

                console.log('자동완성 결과:', results);

                if (results && results.length > 0) {
                  const resultText = results
                    .slice(0, 3)
                    .map(
                      (item, index) =>
                        `${index + 1}. ${item.ingredientName} (ID: ${
                          item.ingredientId
                        })\n   카테고리: ${item.categoryName}`,
                    )
                    .join('\n\n');

                  Alert.alert(
                    'API 테스트 성공!',
                    `검색어: "${randomKeyword}"\n\n결과 (${Math.min(
                      results.length,
                      3,
                    )}개 표시):\n\n${resultText}${
                      results.length > 3
                        ? '\n\n... 외 ' + (results.length - 3) + '개 더'
                        : ''
                    }`,
                    [{ text: '확인' }],
                  );
                } else {
                  Alert.alert(
                    'API 응답',
                    `"${randomKeyword}"에 대한 검색 결과가 없습니다.`,
                  );
                }
              } catch (error) {
                console.error('Auto Complete API 에러:', error);
                Alert.alert('API 에러', `오류: ${error.message}`);
              } finally {
                setIsLoading(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('테스트 함수 에러:', error);
    }
  }, []);

  const testSaveAPI = useCallback(async () => {
    try {
      const mockSaveData = {
        ingredientsInfo: [
          {
            ingredientId: 123,
            categoryId: 2,
            expirationDate: '2025-10-12',
          },
        ],
      };

      Alert.alert(
        '저장 API 테스트',
        '목업 데이터로 냉장고 저장 API를 테스트합니다.\n실제 서버에 데이터가 저장됩니다.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '테스트',
            onPress: async () => {
              setIsLoading(true);
              try {
                console.log('저장 API 테스트 시작');

                const response =
                  await IngredientControllerAPI.addIngredientsToRefrigerator(
                    fridgeId,
                    mockSaveData,
                  );

                console.log('저장 API 응답:', response);
                Alert.alert(
                  '저장 성공!',
                  '목업 데이터가 성공적으로 저장되었습니다.',
                );
              } catch (error) {
                console.error('저장 API 에러:', error);
                Alert.alert('저장 실패', `오류: ${error.message}`);
              } finally {
                setIsLoading(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('저장 테스트 함수 에러:', error);
    }
  }, [fridgeId]);

  // ========== 실제 API 테스트 메소드들 ==========

  const testRealIngredientAPI = useCallback(async () => {
    try {
      Alert.alert(
        '실제 식재료 스캔 API 테스트',
        '갤러리에서 식재료 이미지를 선택하여 실제 서버에 전송합니다.\n네트워크 사용량이 발생할 수 있습니다.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '갤러리 선택',
            onPress: async () => {
              setIsLoading(true);
              try {
                console.log('실제 식재료 스캔 API 테스트 시작');

                const results =
                  await IngredientControllerAPI.testScanWithGalleryImage(
                    'ingredient',
                  );

                console.log('실제 식재료 스캔 결과:', results);

                if (results && results.length > 0) {
                  const resultText = results
                    .map(
                      (item: any, index: number) =>
                        `${index + 1}. ${
                          item.ingredientName || item.name
                        } (ID: ${item.ingredientId || item.id})`,
                    )
                    .join('\n');

                  Alert.alert(
                    '실제 API 테스트 성공!',
                    `서버에서 ${results.length}개의 식재료를 인식했습니다:\n\n${resultText}`,
                    [
                      {
                        text: '상세 로그 보기',
                        onPress: () => {
                          Alert.alert(
                            '상세 응답',
                            JSON.stringify(results, null, 2),
                          );
                        },
                      },
                      { text: '확인' },
                    ],
                  );
                } else {
                  Alert.alert(
                    'API 응답',
                    '서버에서 식재료를 인식하지 못했습니다.\n응답: 빈 배열',
                  );
                }
              } catch (error) {
                console.error('실제 식재료 API 테스트 실패:', error);
                Alert.alert(
                  '실제 API 테스트 실패',
                  `오류 유형: ${error.name || 'Unknown'}\n메시지: ${
                    error.message
                  }\n\n이는 실제 서버 응답입니다.`,
                  [
                    {
                      text: '네트워크 로그 보기',
                      onPress: () => {
                        console.log('=== 네트워크 오류 상세 정보 ===');
                        console.log('Error Stack:', error.stack);
                        console.log('Error Object:', error);
                      },
                    },
                    { text: '확인' },
                  ],
                );
              } finally {
                setIsLoading(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('테스트 함수 에러:', error);
    }
  }, []);

  const testRealReceiptAPI = useCallback(async () => {
    try {
      Alert.alert(
        '실제 영수증 스캔 API 테스트',
        '갤러리에서 영수증 이미지를 선택하여 실제 서버에 전송합니다.\n네트워크 사용량이 발생할 수 있습니다.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '갤러리 선택',
            onPress: async () => {
              setIsLoading(true);
              try {
                console.log('실제 영수증 스캔 API 테스트 시작');

                const results =
                  await IngredientControllerAPI.testScanWithGalleryImage(
                    'receipt',
                  );

                console.log('실제 영수증 스캔 결과:', results);

                if (results && results.length > 0) {
                  const resultText = results
                    .map(
                      (item: any, index: number) =>
                        `${index + 1}. ${item.ingredientName} (입력: ${
                          item.input_name || item.ingredientName
                        })`,
                    )
                    .join('\n');

                  Alert.alert(
                    '실제 API 테스트 성공!',
                    `서버에서 ${results.length}개의 식재료를 인식했습니다:\n\n${resultText}`,
                    [
                      {
                        text: '상세 로그 보기',
                        onPress: () => {
                          Alert.alert(
                            '상세 응답',
                            JSON.stringify(results, null, 2),
                          );
                        },
                      },
                      { text: '확인' },
                    ],
                  );
                } else {
                  Alert.alert(
                    'API 응답',
                    '서버에서 영수증의 식재료를 인식하지 못했습니다.\n응답: 빈 배열',
                  );
                }
              } catch (error) {
                console.error('실제 영수증 API 테스트 실패:', error);
                Alert.alert(
                  '실제 API 테스트 실패',
                  `오류 유형: ${error.name || 'Unknown'}\n메시지: ${
                    error.message
                  }\n\n이는 실제 서버 응답입니다.`,
                  [
                    {
                      text: '네트워크 로그 보기',
                      onPress: () => {
                        console.log('=== 네트워크 오류 상세 정보 ===');
                        console.log('Error Stack:', error.stack);
                        console.log('Error Object:', error);
                      },
                    },
                    { text: '확인' },
                  ],
                );
              } finally {
                setIsLoading(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('테스트 함수 에러:', error);
    }
  }, []);

  const runFullAPITest = useCallback(async () => {
    try {
      Alert.alert(
        '종합 API 테스트',
        '모든 API 엔드포인트를 순차적으로 테스트합니다.\n시간이 다소 걸릴 수 있습니다.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '테스트 시작',
            onPress: async () => {
              setIsLoading(true);
              try {
                console.log('=== 종합 API 테스트 시작 ===');

                const testResults =
                  await IngredientControllerAPI.runFullAPITest();

                console.log('종합 API 테스트 완료:', testResults);

                const formatResult = (test: any) => {
                  const status = test.success ? '✅ 성공' : '❌ 실패';
                  const time = `${test.responseTime}ms`;
                  const error = test.error ? `\n오류: ${test.error}` : '';
                  return `${status} (${time})${error}`;
                };

                const reportText =
                  `자동완성 API: ${formatResult(
                    testResults.autoComplete,
                  )}\n\n` +
                  `서버 연결: ${formatResult(
                    testResults.serverConnection,
                  )}\n\n` +
                  `저장 API: ${formatResult(testResults.saveTest)}`;

                Alert.alert('API 테스트 완료', reportText, [
                  {
                    text: '상세 로그 보기',
                    onPress: () => {
                      console.log('=== 종합 테스트 상세 결과 ===');
                      console.log(JSON.stringify(testResults, null, 2));
                      Alert.alert(
                        '상세 결과',
                        JSON.stringify(testResults, null, 2),
                      );
                    },
                  },
                  { text: '확인' },
                ]);
              } catch (error) {
                console.error('종합 API 테스트 실패:', error);
                Alert.alert(
                  '종합 테스트 실패',
                  `전체 테스트 중 오류 발생: ${error.message}`,
                );
              } finally {
                setIsLoading(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('테스트 함수 에러:', error);
    }
  }, []);

  const testNetworkAndServer = useCallback(async () => {
    try {
      Alert.alert(
        '네트워크 & 서버 테스트',
        '네트워크 연결 상태와 서버 응답 속도를 테스트합니다.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '테스트 시작',
            onPress: async () => {
              setIsLoading(true);
              try {
                console.log('네트워크 & 서버 테스트 시작');

                const connectionResult =
                  await IngredientControllerAPI.testServerConnection();

                console.log('연결 테스트 결과:', connectionResult);

                const statusIcon = connectionResult.isConnected ? '🟢' : '🔴';
                const statusText = connectionResult.isConnected
                  ? '연결됨'
                  : '연결 실패';
                const responseTimeText = `응답 시간: ${connectionResult.responseTime}ms`;
                const serverInfoText = connectionResult.serverInfo
                  ? `\n검색 결과: ${connectionResult.serverInfo.resultsCount}개`
                  : '';
                const errorText = connectionResult.error
                  ? `\n오류: ${connectionResult.error}`
                  : '';

                Alert.alert(
                  '네트워크 테스트 결과',
                  `${statusIcon} 서버 상태: ${statusText}\n${responseTimeText}${serverInfoText}${errorText}`,
                  [
                    {
                      text: '네트워크 정보 보기',
                      onPress: () => {
                        console.log('=== 네트워크 상세 정보 ===');
                        console.log('Connection Result:', connectionResult);
                      },
                    },
                    { text: '확인' },
                  ],
                );
              } catch (error) {
                console.error('네트워크 테스트 실패:', error);
                Alert.alert(
                  '네트워크 테스트 실패',
                  `테스트 중 오류 발생: ${error.message}`,
                );
              } finally {
                setIsLoading(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('테스트 함수 에러:', error);
    }
  }, []);

  // 모드 선택 화면
  if (!scanMode) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
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
              {/* 기존 카메라 촬영 옵션들 */}
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

              {/* 개발 환경에서만 보이는 API 테스트 섹션 */}
              {isDevelopment && (
                <>
                  {/* 목업 테스트 구분선 */}
                  <View style={styles.divider}>
                    <Text style={styles.dividerText}>🧪 목업 테스트</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.modeButton, { backgroundColor: '#e3f2fd' }]}
                    onPress={() => testWithMockData('ingredient')}
                    disabled={isLoading}
                  >
                    <View
                      style={[
                        styles.modeIconContainer,
                        { backgroundColor: '#2196f3' },
                      ]}
                    >
                      <MaterialIcons name="eco" size={48} color="#fff" />
                    </View>
                    <Text style={[styles.modeTitle, { color: '#1976d2' }]}>
                      식재료 목업 테스트
                    </Text>
                    <Text
                      style={[styles.modeDescription, { color: '#1976d2' }]}
                    >
                      목업 데이터로 식재료 스캔{'\n'}결과를 시뮬레이션합니다
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modeButton, { backgroundColor: '#f3e5f5' }]}
                    onPress={() => testWithMockData('receipt')}
                    disabled={isLoading}
                  >
                    <View
                      style={[
                        styles.modeIconContainer,
                        { backgroundColor: '#9c27b0' },
                      ]}
                    >
                      <MaterialIcons name="receipt" size={48} color="#fff" />
                    </View>
                    <Text style={[styles.modeTitle, { color: '#7b1fa2' }]}>
                      영수증 목업 테스트
                    </Text>
                    <Text
                      style={[styles.modeDescription, { color: '#7b1fa2' }]}
                    >
                      목업 데이터로 영수증 스캔{'\n'}결과를 시뮬레이션합니다
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modeButton, { backgroundColor: '#e8f5e8' }]}
                    onPress={testAutoCompleteOnly}
                    disabled={isLoading}
                  >
                    <View
                      style={[
                        styles.modeIconContainer,
                        { backgroundColor: '#4caf50' },
                      ]}
                    >
                      <MaterialIcons name="search" size={48} color="#fff" />
                    </View>
                    <Text style={[styles.modeTitle, { color: '#388e3c' }]}>
                      자동완성 API 테스트
                    </Text>
                    <Text
                      style={[styles.modeDescription, { color: '#388e3c' }]}
                    >
                      식재료 검색 API를{'\n'}직접 호출해서 테스트합니다
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modeButton, { backgroundColor: '#fff3e0' }]}
                    onPress={testSaveAPI}
                    disabled={isLoading}
                  >
                    <View
                      style={[
                        styles.modeIconContainer,
                        { backgroundColor: '#ff9800' },
                      ]}
                    >
                      <MaterialIcons name="save" size={48} color="#fff" />
                    </View>
                    <Text style={[styles.modeTitle, { color: '#f57c00' }]}>
                      저장 API 테스트
                    </Text>
                    <Text
                      style={[styles.modeDescription, { color: '#f57c00' }]}
                    >
                      실제 냉장고 저장 API를{'\n'}목업 데이터로 테스트합니다
                    </Text>
                  </TouchableOpacity>

                  {/* 실제 API 테스트 구분선 */}
                  <View style={styles.divider}>
                    <Text style={styles.dividerText}>🔥 실제 API 테스트</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.modeButton, { backgroundColor: '#ffebee' }]}
                    onPress={testRealIngredientAPI}
                    disabled={isLoading}
                  >
                    <View
                      style={[
                        styles.modeIconContainer,
                        { backgroundColor: '#f44336' },
                      ]}
                    >
                      <MaterialIcons name="camera" size={48} color="#fff" />
                    </View>
                    <Text style={[styles.modeTitle, { color: '#c62828' }]}>
                      실제 식재료 스캔 API
                    </Text>
                    <Text
                      style={[styles.modeDescription, { color: '#c62828' }]}
                    >
                      갤러리 이미지로 실제 서버에{'\n'}식재료 스캔 요청을
                      보냅니다
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modeButton, { backgroundColor: '#f3e5f5' }]}
                    onPress={testRealReceiptAPI}
                    disabled={isLoading}
                  >
                    <View
                      style={[
                        styles.modeIconContainer,
                        { backgroundColor: '#9c27b0' },
                      ]}
                    >
                      <MaterialIcons
                        name="receipt-long"
                        size={48}
                        color="#fff"
                      />
                    </View>
                    <Text style={[styles.modeTitle, { color: '#7b1fa2' }]}>
                      실제 영수증 스캔 API
                    </Text>
                    <Text
                      style={[styles.modeDescription, { color: '#7b1fa2' }]}
                    >
                      갤러리 이미지로 실제 서버에{'\n'}영수증 스캔 요청을
                      보냅니다
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modeButton, { backgroundColor: '#e8f5e8' }]}
                    onPress={testNetworkAndServer}
                    disabled={isLoading}
                  >
                    <View
                      style={[
                        styles.modeIconContainer,
                        { backgroundColor: '#4caf50' },
                      ]}
                    >
                      <MaterialIcons
                        name="network-check"
                        size={48}
                        color="#fff"
                      />
                    </View>
                    <Text style={[styles.modeTitle, { color: '#388e3c' }]}>
                      네트워크 & 서버 테스트
                    </Text>
                    <Text
                      style={[styles.modeDescription, { color: '#388e3c' }]}
                    >
                      서버 연결 상태와{'\n'}응답 속도를 확인합니다
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modeButton, { backgroundColor: '#fff3e0' }]}
                    onPress={runFullAPITest}
                    disabled={isLoading}
                  >
                    <View
                      style={[
                        styles.modeIconContainer,
                        { backgroundColor: '#ff9800' },
                      ]}
                    >
                      <MaterialIcons name="assessment" size={48} color="#fff" />
                    </View>
                    <Text style={[styles.modeTitle, { color: '#f57c00' }]}>
                      종합 API 테스트
                    </Text>
                    <Text
                      style={[styles.modeDescription, { color: '#f57c00' }]}
                    >
                      모든 API 엔드포인트를{'\n'}한 번에 테스트합니다
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* 로딩 상태 표시 */}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#f8f8f8" />
                <Text style={styles.loadingText}>처리 중...</Text>
              </View>
            )}
          </View>
        </ScrollView>
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
