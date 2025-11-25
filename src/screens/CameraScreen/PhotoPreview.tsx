import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Text,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  IngredientControllerAPI,
  ConfirmedIngredient,
  PhotoScanResult,
  ScanResultItem,
} from '../../services/API/ingredientControllerAPI';
import { RootStackParamList } from '../../../App';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { previewStyles as styles } from './styles';
import ConfirmModal from '../../components/modals/ConfirmModal';

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

  // 모달 상태 관리
  const [imageLoadErrorModalVisible, setImageLoadErrorModalVisible] =
    useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [emptyResultsModalVisible, setEmptyResultsModalVisible] =
    useState(false);
  const [networkErrorModalVisible, setNetworkErrorModalVisible] =
    useState(false);
  const [serverErrorModalVisible, setServerErrorModalVisible] = useState(false);
  const [serverErrorMessage, setServerErrorMessage] = useState('');
  const [generalErrorModalVisible, setGeneralErrorModalVisible] =
    useState(false);
  const [generalErrorMessage, setGeneralErrorMessage] = useState('');
  const [scanEmptyModalVisible, setScanEmptyModalVisible] = useState(false);

  // 강화된 에러 모달 상태
  const [robustErrorModalVisible, setRobustErrorModalVisible] = useState(false);
  const [robustErrorTitle, setRobustErrorTitle] = useState('');
  const [robustErrorMessage, setRobustErrorMessage] = useState('');
  const [robustErrorActions, setRobustErrorActions] = useState<any[]>([]);

  // 컴포넌트 마운트 시 자동 스캔 시작
  useEffect(() => {
    if (!imageLoading) {
      handleAutoScan();
    }
  }, [imageLoading]);

  /**
   * 자동 스캔 처리
   */
  const handleAutoScan = useCallback(async () => {
    try {
      setIsScanning(true);

      const confirmedIngredients =
        await IngredientControllerAPI.performRobustScan(
          photo.uri,
          scanMode,
          progress => {
            setScanProgress(progress);
          },
        );

      // console.log('강화된 스캔 완료');

      // 결과 처리
      if (confirmedIngredients && confirmedIngredients.length > 0) {
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
        setScanProgress('인식 완료');

        setTimeout(() => {
          handleEmptyResults();
        }, 1000);
      }
    } catch (error) {
      handleRobustScanError(error);
    } finally {
      setIsScanning(false);
      setScanProgress('');
    }
  }, [scanMode, photo.uri, fridgeId, navigation]);

  /**
   * 강화된 에러 처리
   */
  const handleRobustScanError = useCallback((error: any) => {
    const errorInfo =
      IngredientControllerAPI.generateUserFriendlyErrorMessage(error);

    setRobustErrorTitle(errorInfo.title);
    setRobustErrorMessage(errorInfo.message);
    setRobustErrorActions(errorInfo.actions);
    setRobustErrorModalVisible(true);
  }, []);

  /**
   * 강화된 에러 액션 처리
   */
  const handleRobustErrorAction = useCallback(
    (action: string) => {
      setRobustErrorModalVisible(false);

      switch (action) {
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
    [navigation, handleManualInput, handleAutoScan],
  );

  /**
   * 빈 결과 처리
   */
  const handleEmptyResults = useCallback(() => {
    setEmptyResultsModalVisible(true);
  }, []);

  /**
   * 에러 처리
   */
  const handleScanError = useCallback((error: any) => {
    const errorMessage = error?.message || '';

    // 네트워크/서버 연결 문제
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      setNetworkErrorModalVisible(true);
    }
    // API 응답 오류 (400, 500 등)
    else if (errorMessage.includes('API 실패')) {
      setServerErrorMessage(errorMessage);
      setServerErrorModalVisible(true);
    }
    // 기타 오류
    else {
      setGeneralErrorMessage(errorMessage);
      setGeneralErrorModalVisible(true);
    }
  }, []);

  /**
   * 스캔 결과가 없는 경우 처리
   */
  const handleScanEmpty = useCallback(() => {
    setScanEmptyModalVisible(true);
  }, []);

  /**
   * 수동 입력으로 전환
   */
  const handleManualInput = useCallback(() => {
    navigation.navigate('AddItemScreen', {
      fridgeId,
      recognizedData: {
        photo: photo.uri,
        name: '',
        quantity: 1,
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
    setCancelModalVisible(true);
  }, []);

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
    setImageLoadErrorModalVisible(true);
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

  const modeText = scanMode === 'ingredient' ? '식재료' : '영수증 항목';

  return (
    <SafeAreaView style={styles.previewContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#222222" />

      {/* Header */}
      <View style={styles.previewHeader}>
        <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
          <MaterialIcons name="arrow-back-ios-new" size={24} color="#f8f8f8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <View style={styles.rightSection} />
      </View>

      {/* Image Container */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlace}>
          <Image
            source={{ uri: photo.uri }}
            style={[styles.previewImage, getImageStyle()]}
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {/* Image Loading Overlay */}
          {imageLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#2F4858" />
              <Text style={styles.loadingText}>이미지 로딩 중...</Text>
            </View>
          )}

          {/* Scanning Overlay */}
          {!imageLoading && isScanning && (
            <View style={styles.scanningOverlay}>
              <ActivityIndicator size="large" color="#2F4858" />
              <Text style={styles.scanningText}>{getScanningText()}</Text>

              {/* Retry */}
              {retryCount > 0 && (
                <Text style={styles.retryCountText}>
                  재시도 중... ({retryCount}/3)
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>{infoText}</Text>
        <Text style={styles.subInfoText}>
          {isScanning
            ? '잠시만 기다려주세요'
            : '처리가 완료되면 자동으로 이동합니다'}
        </Text>

        {/* Manual Button */}
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
      </View>

      {/* 모달들 */}
      {/* 이미지 로드 에러 */}
      <ConfirmModal
        isAlert={false}
        visible={imageLoadErrorModalVisible}
        title="오류"
        message="이미지를 불러올 수 없습니다."
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={() => {
          setImageLoadErrorModalVisible(false);
          navigation.goBack();
        }}
        onCancel={() => {
          setImageLoadErrorModalVisible(false);
          navigation.goBack();
        }}
      />

      {/* 취소 확인 */}
      <ConfirmModal
        isAlert={true}
        visible={cancelModalVisible}
        title="취소하시겠습니까?"
        message="촬영한 사진이 삭제됩니다."
        iconContainer={{ backgroundColor: '#e8f5e9' }}
        icon={{ name: 'error-outline', color: 'rgba(47, 72, 88, 1)', size: 48 }}
        confirmText="나가기"
        cancelText="계속 처리"
        confirmButtonStyle="general"
        onConfirm={() => {
          setCancelModalVisible(false);
          navigation.goBack();
        }}
        onCancel={() => setCancelModalVisible(false)}
      />

      {/* 빈 결과 처리 */}
      <ConfirmModal
        isAlert={true}
        visible={emptyResultsModalVisible}
        title="인식 완료"
        message={`이미지 처리는 성공했지만 ${modeText}를 찾을 수 없었습니다.\n\n가능한 원인:\n• 이미지가 흐릿하거나 조명이 부족\n• ${modeText}가 명확하게 보이지 않음\n• 현재 AI가 인식하지 못하는 ${modeText}\n\n다른 방법으로 진행하시겠습니까?`}
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'info-outline', color: '#FF6B6B', size: 48 }}
        confirmText="다시 촬영"
        cancelText="수동 입력"
        confirmButtonStyle="danger"
        onConfirm={() => {
          setEmptyResultsModalVisible(false);
          navigation.goBack();
        }}
        onCancel={() => {
          setEmptyResultsModalVisible(false);
          handleManualInput();
        }}
      />

      {/* 네트워크 에러 */}
      <ConfirmModal
        isAlert={true}
        visible={networkErrorModalVisible}
        title="연결 오류"
        message="서버에 연결할 수 없습니다.\n인터넷 연결을 확인하고 다시 시도해주세요."
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="다시 시도"
        cancelText="수동 입력"
        confirmButtonStyle="danger"
        onConfirm={() => {
          setNetworkErrorModalVisible(false);
          setTimeout(() => handleAutoScan(), 1000);
        }}
        onCancel={() => {
          setNetworkErrorModalVisible(false);
          handleManualInput();
        }}
      />

      {/* 서버 에러 */}
      <ConfirmModal
        isAlert={true}
        visible={serverErrorModalVisible}
        title="서버 오류"
        message={`서버에서 처리 중 오류가 발생했습니다.\n\n${serverErrorMessage}\n\n다른 방법으로 진행하시겠습니까?`}
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="다시 시도"
        cancelText="수동 입력"
        confirmButtonStyle="danger"
        onConfirm={() => {
          setServerErrorModalVisible(false);
          setTimeout(() => handleAutoScan(), 2000);
        }}
        onCancel={() => {
          setServerErrorModalVisible(false);
          handleManualInput();
        }}
      />

      {/* 일반 에러 */}
      <ConfirmModal
        isAlert={true}
        visible={generalErrorModalVisible}
        title="처리 오류"
        message={`${
          scanMode === 'ingredient' ? '식재료' : '영수증'
        } 처리 중 오류가 발생했습니다.\n\n${generalErrorMessage}`}
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="수동 입력"
        cancelText="다시 촬영"
        confirmButtonStyle="danger"
        onConfirm={() => {
          setGeneralErrorModalVisible(false);
          handleManualInput();
        }}
        onCancel={() => {
          setGeneralErrorModalVisible(false);
          navigation.goBack();
        }}
      />

      {/* 스캔 결과 없음 */}
      <ConfirmModal
        isAlert={true}
        visible={scanEmptyModalVisible}
        title="인식 결과 없음"
        message={`${
          scanMode === 'ingredient' ? '식재료' : '영수증'
        }에서 항목을 인식할 수 없습니다.\n다른 방법으로 진행하시겠습니까?`}
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'info-outline', color: '#FF6B6B', size: 48 }}
        confirmText="수동 입력"
        cancelText="다시 촬영"
        confirmButtonStyle="danger"
        onConfirm={() => {
          setScanEmptyModalVisible(false);
          handleManualInput();
        }}
        onCancel={() => {
          setScanEmptyModalVisible(false);
          handleRetake();
        }}
      />

      {/* 강화된 에러 처리 - 첫 번째 액션용 */}
      {robustErrorActions.length > 0 && (
        <ConfirmModal
          isAlert={true}
          visible={robustErrorModalVisible}
          title={robustErrorTitle}
          message={robustErrorMessage}
          iconContainer={{ backgroundColor: '#FFE5E5' }}
          icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
          confirmText={robustErrorActions[0]?.text || '확인'}
          cancelText={robustErrorActions[1]?.text || '취소'}
          confirmButtonStyle={'danger'}
          onConfirm={() =>
            handleRobustErrorAction(robustErrorActions[0]?.action)
          }
          onCancel={() => {
            if (robustErrorActions[1]) {
              handleRobustErrorAction(robustErrorActions[1]?.action);
            } else {
              setRobustErrorModalVisible(false);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default PhotoPreviewScreen;
