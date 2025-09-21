import React, { useState, useCallback, useEffect } from 'react';
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
import {
  IngredientControllerAPI,
  ConfirmedIngredient,
  PhotoScanResult,
  ScanResultItem,
} from '../../services/API/ingredientControllerAPI';

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

  const { photo, fridgeId, scanMode } = route.params;

  const [imageLoading, setImageLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // 컴포넌트 마운트 시 자동 스캔 시작
  useEffect(() => {
    if (!imageLoading) {
      handleAutoScan();
    }
  }, [imageLoading]);

  /**
   * 향상된 자동 스캔 처리 (500 오류 해결 + 재시도)
   */
  // PhotoPreviewScreen.tsx의 handleAutoScan 메서드 수정

  // PhotoPreviewScreen.tsx의 handleAutoScan 메서드를 이것으로 교체하세요

  const handleAutoScan = useCallback(async () => {
    if (!scanMode || !photo?.uri) {
      console.error('스캔 모드 또는 사진 URI가 없습니다.');
      return;
    }

    try {
      setIsScanning(true);

      console.log(`${scanMode} 강화된 스캔 시작, URI:`, photo.uri);

      // ✅ 강화된 스캔 메서드 사용 (AI 폴백 포함)
      const confirmedIngredients =
        await IngredientControllerAPI.performRobustScan(
          photo.uri,
          scanMode,
          progress => {
            setScanProgress(progress);
          },
        );

      console.log('강화된 스캔 완료:', {
        success: true,
        resultCount: confirmedIngredients?.length || 0,
      });

      // 결과 처리
      if (confirmedIngredients && confirmedIngredients.length > 0) {
        console.log('스캔 결과 있음 - AddItemScreen으로 이동');
        setScanProgress('인식 완료!');

        setTimeout(() => {
          navigation.navigate('AddItemScreen', {
            fridgeId,
            scanResults: confirmedIngredients,
            scanMode,
          });
        }, 500);
      } else {
        // 빈 결과 처리
        console.log('스캔 성공했지만 인식된 항목 없음');
        setScanProgress('인식 완료');

        setTimeout(() => {
          handleEmptyResults();
        }, 1000);
      }
    } catch (error) {
      console.error(`${scanMode} 강화된 스캔 오류:`, error);
      handleRobustScanError(error);
    } finally {
      setIsScanning(false);
      setScanProgress('');
    }
  }, [photo?.uri, scanMode, fridgeId, navigation]);

  /**
   * 강화된 에러 처리 (사용자 친화적 메시지)
   */
  const handleRobustScanError = useCallback(
    (error: any) => {
      const errorInfo =
        IngredientControllerAPI.generateUserFriendlyErrorMessage(error);

      const alertActions = errorInfo.actions.map(action => ({
        text: action.text,
        onPress: () => {
          switch (action.action) {
            case 'retake':
              navigation.goBack();
              break;
            case 'manual':
              handleManualInput();
              break;
            case 'retry':
              setTimeout(() => handleAutoScan(), 1000);
              break;
            case 'cancel':
            default:
              navigation.goBack();
              break;
          }
        },
        ...(action.action === 'cancel' && { style: 'cancel' as const }),
      }));

      Alert.alert(errorInfo.title, errorInfo.message, alertActions);
    },
    [navigation, handleManualInput, handleAutoScan],
  );

  /**
   * 빈 결과 처리 (개선된 버전)
   */
  const handleEmptyResults = useCallback(() => {
    const modeText = scanMode === 'ingredient' ? '식재료' : '영수증 항목';

    Alert.alert(
      '인식 완료',
      `이미지 처리는 성공했지만 ${modeText}를 찾을 수 없었습니다.\n\n가능한 원인:\n• 이미지가 흐릿하거나 조명이 부족\n• ${modeText}가 명확하게 보이지 않음\n• 현재 AI가 인식하지 못하는 ${modeText}\n\n다른 방법으로 진행하시겠습니까?`,
      [
        {
          text: '다시 촬영',
          onPress: () => navigation.goBack(),
        },
        {
          text: '수동 입력',
          onPress: handleManualInput,
        },
        {
          text: '취소',
          style: 'cancel',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  }, [scanMode, navigation, handleManualInput]);

  /**
   * ✅ 개선된 에러 처리
   */
  const handleScanError = useCallback(
    (error: any) => {
      const errorMessage = error?.message || '';

      // 네트워크/서버 연결 문제
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        Alert.alert(
          '연결 오류',
          '서버에 연결할 수 없습니다.\n인터넷 연결을 확인하고 다시 시도해주세요.',
          [
            {
              text: '다시 시도',
              onPress: () => setTimeout(() => handleAutoScan(), 1000),
            },
            {
              text: '수동 입력',
              onPress: handleManualInput,
            },
            {
              text: '취소',
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      }
      // API 응답 오류 (400, 500 등)
      else if (errorMessage.includes('API 실패')) {
        Alert.alert(
          '서버 오류',
          `서버에서 처리 중 오류가 발생했습니다.\n\n${errorMessage}\n\n다른 방법으로 진행하시겠습니까?`,
          [
            {
              text: '다시 시도',
              onPress: () => setTimeout(() => handleAutoScan(), 2000),
            },
            {
              text: '수동 입력',
              onPress: handleManualInput,
            },
            {
              text: '취소',
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      }
      // 기타 오류
      else {
        Alert.alert(
          '처리 오류',
          `${
            scanMode === 'ingredient' ? '식재료' : '영수증'
          } 처리 중 오류가 발생했습니다.\n\n${errorMessage}`,
          [
            {
              text: '수동 입력',
              onPress: handleManualInput,
            },
            {
              text: '다시 촬영',
              onPress: () => navigation.goBack(),
            },
            {
              text: '취소',
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      }
    },
    [scanMode, handleAutoScan, handleManualInput, navigation],
  );

  /**
   * 오프라인 모드 (목업 데이터 사용)
   */
  const handleOfflineMode = useCallback(async () => {
    try {
      setIsScanning(true);
      setScanProgress('오프라인 모드로 처리 중...');

      let offlineResults: ConfirmedIngredient[];

      if (scanMode === 'ingredient') {
        const scanResults = await IngredientControllerAPI.scanPhotoForSimulator(
          photo.uri,
        );
        offlineResults = IngredientControllerAPI.convertScanToConfirmed(
          scanResults,
          scanMode,
        );
      } else {
        const scanResults =
          await IngredientControllerAPI.scanReceiptForSimulator(photo.uri);
        offlineResults = IngredientControllerAPI.convertScanToConfirmed(
          scanResults,
          scanMode,
        );
      }

      setScanProgress('오프라인 처리 완료!');

      setTimeout(() => {
        navigation.navigate('AddItemScreen', {
          fridgeId,
          scanResults: offlineResults,
          scanMode,
          isOfflineMode: true,
        });
      }, 500);
    } catch (offlineError) {
      console.error('오프라인 모드 실패:', offlineError);
      Alert.alert(
        '오프라인 모드 실패',
        '오프라인 처리도 실패했습니다.\n수동 입력으로 진행해주세요.',
        [
          { text: '수동 입력', onPress: handleManualInput },
          { text: '취소', onPress: handleCancel },
        ],
      );
    } finally {
      setIsScanning(false);
      setScanProgress('');
    }
  }, [scanMode, photo.uri, fridgeId, navigation]);

  /**
   * 스캔 결과가 없는 경우 처리
   */
  const handleScanEmpty = useCallback(() => {
    const modeText = scanMode === 'ingredient' ? '식재료' : '영수증';

    Alert.alert(
      '인식 결과 없음',
      `${modeText}에서 항목을 인식할 수 없습니다.\n다른 방법으로 진행하시겠습니까?`,
      [
        { text: '수동 입력', onPress: handleManualInput },
        { text: '다시 촬영', onPress: handleRetake },
        { text: '취소', style: 'cancel', onPress: handleCancel },
      ],
    );
  }, [scanMode]);

  /**
   * 수동 입력으로 전환
   */
  const handleManualInput = useCallback(() => {
    navigation.navigate('AddItemScreen', {
      fridgeId,
      recognizedData: {
        photo: photo.uri,
        name: '',
        quantity: '1',
        unit: '개',
        expiryDate: '',
        itemCategory: '기타',
      },
      scanMode,
      isManualInput: true,
    });
  }, [navigation, photo.uri, fridgeId, scanMode]);

  /**
   * 다시 촬영
   */
  const handleRetake = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  /**
   * 취소 (뒤로가기)
   */
  const handleCancel = useCallback(() => {
    Alert.alert('취소하시겠습니까?', '촬영한 사진이 삭제됩니다.', [
      { text: '계속 처리', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => {
          navigation.goBack();
        },
      },
    ]);
  }, [navigation]);

  /**
   * 이미지 스타일 계산
   */
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

  // 스캔 모드에 따른 표시 텍스트
  const getScanningText = () => {
    if (scanProgress) {
      return scanProgress;
    }

    const baseText =
      scanMode === 'ingredient'
        ? '식재료를 인식하고 있습니다...'
        : '영수증을 분석하고 있습니다...';

    if (retryCount > 0) {
      return `${baseText} (재시도 ${retryCount}/3)`;
    }

    return baseText;
  };

  const headerTitle =
    scanMode === 'ingredient' ? '식재료 인식 중' : '영수증 분석 중';

  const infoText =
    scanMode === 'ingredient'
      ? '촬영한 식재료를 자동으로 인식하고 있습니다'
      : '촬영한 영수증에서 식재료를 찾고 있습니다';

  return (
    <SafeAreaView style={styles.previewContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#222222" />

      {/* 헤더 */}
      <View style={styles.previewHeader}>
        <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
          <MaterialIcons name="arrow-back-ios-new" size={24} color="#f8f8f8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <View style={styles.rightSection} />
      </View>

      {/* 이미지 컨테이너 */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlace}>
          <Image
            source={{ uri: photo.uri }}
            style={[styles.previewImage, getImageStyle()]}
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {/* 이미지 로딩 오버레이 */}
          {imageLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#f8f8f8" />
              <Text style={styles.loadingText}>이미지 로딩 중...</Text>
            </View>
          )}

          {/* 스캔 진행 오버레이 */}
          {!imageLoading && isScanning && (
            <View style={styles.scanningOverlay}>
              <ActivityIndicator size="large" color="#f8f8f8" />
              <Text style={styles.scanningText}>{getScanningText()}</Text>

              {/* 진행 상황 표시 */}
              {scanProgress && (
                <Text style={styles.progressText}>{scanProgress}</Text>
              )}

              {/* 재시도 카운터 표시 */}
              {retryCount > 0 && (
                <Text style={styles.retryCountText}>
                  재시도 중... ({retryCount}/3)
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* 하단 정보 */}
      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>{infoText}</Text>
        <Text style={styles.subInfoText}>
          {isScanning
            ? '잠시만 기다려주세요'
            : '처리가 완료되면 자동으로 이동합니다'}
        </Text>

        {/* 수동 처리 버튼 (스캔 중일 때만 표시) */}
        {isScanning && (
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => {
              setIsScanning(false);
              setScanProgress('');
              handleScanEmpty();
            }}
          >
            <Text style={styles.manualButtonText}>수동 입력으로 진행</Text>
          </TouchableOpacity>
        )}

        {/* 서버 상태 표시 (개발 모드에서만) */}
        {__DEV__ && (
          <Text style={styles.debugText}>
            스캔 모드: {scanMode} | 진행 상황: {scanProgress || '대기 중'} |
            재시도: {retryCount}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default PhotoPreviewScreen;
