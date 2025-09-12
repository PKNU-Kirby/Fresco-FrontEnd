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

  const { photo, fridgeId, scanMode } = route.params; // scanMode가 route params에 있다고 가정

  const [imageLoading, setImageLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  // 컴포넌트 마운트 시 자동 스캔 시작
  useEffect(() => {
    if (!imageLoading) {
      handleAutoScan();
    }
  }, [imageLoading]);

  /**
   * 통합 자동 스캔 처리
   */
  const handleAutoScan = useCallback(async () => {
    if (!scanMode) {
      console.error('스캔 모드가 지정되지 않았습니다.');
      return;
    }

    // photo.uri 유효성 검사 추가
    if (!photo?.uri) {
      console.error('사진 URI가 없습니다.');
      handleScanError(new Error('사진을 먼저 촬영해주세요.'));
      return;
    }

    try {
      setIsScanning(true);
      console.log(`${scanMode} 자동 스캔 시작, URI:`, photo.uri);

      // IngredientControllerAPI의 통합 스캔 메소드 사용
      const confirmedIngredients =
        await IngredientControllerAPI.performScanSafe(photo.uri, scanMode);

      if (confirmedIngredients && confirmedIngredients.length > 0) {
        console.log('스캔 성공:', confirmedIngredients);
        // AddItemScreen으로 이동 (확인된 식재료와 함께)
        navigation.navigate('AddItemScreen', {
          fridgeId,
          scanResults: confirmedIngredients,
          scanMode,
        });
      } else {
        // 스캔 실패 시 사용자 옵션 제공
        handleScanFailure();
      }
    } catch (error) {
      console.error(`${scanMode} 스캔 오류:`, error);
      handleScanError(error);
    } finally {
      setIsScanning(false);
    }
  }, [photo?.uri, scanMode, fridgeId, navigation]); // photo?.uri로 변경

  /**
   * 스캔 실패 처리
   */
  const handleScanFailure = useCallback(() => {
    const modeText = scanMode === 'ingredient' ? '식재료' : '영수증';

    Alert.alert(
      '인식 실패',
      `${modeText}에서 항목을 인식할 수 없습니다.\n어떻게 진행하시겠습니까?`,
      [
        { text: '수동 입력', onPress: handleManualInput },
        { text: '다시 촬영', onPress: handleRetake },
        { text: '취소', style: 'cancel', onPress: handleCancel },
      ],
    );
  }, [scanMode]);

  /**
   * 스캔 오류 처리
   */
  const handleScanError = useCallback(
    (error: any) => {
      const modeText =
        scanMode === 'ingredient' ? '식재료 인식' : '영수증 스캔';
      const errorMessage = error?.message || '알 수 없는 오류가 발생했습니다.';

      Alert.alert(
        '스캔 오류',
        `${modeText} 중 오류가 발생했습니다.\n${errorMessage}`,
        [
          { text: '수동 입력', onPress: handleManualInput },
          { text: '다시 촬영', onPress: handleRetake },
          { text: '취소', style: 'cancel', onPress: handleCancel },
        ],
      );
    },
    [scanMode],
  );

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
    });
  }, [navigation, photo.uri, fridgeId]);

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
  const scanningText =
    scanMode === 'ingredient'
      ? '식재료를 인식하고 있습니다...'
      : '영수증을 분석하고 있습니다...';

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
              <Text style={styles.scanningText}>{scanningText}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 하단 정보 */}
      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>{infoText}</Text>
        <Text style={styles.subInfoText}>잠시만 기다려주세요</Text>

        {/* 수동 처리 버튼 (스캔 중일 때만 표시) */}
        {isScanning && (
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => {
              setIsScanning(false);
              handleScanFailure();
            }}
          >
            <Text style={styles.manualButtonText}>수동 입력으로 진행</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default PhotoPreviewScreen;
