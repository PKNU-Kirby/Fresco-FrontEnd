import React, { useState, useCallback } from 'react';
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

  const { photo, fridgeId } = route.params;
  const [imageLoading, setImageLoading] = useState(true);

  const handleIngredientScan = useCallback(async () => {
    try {
      setIsScanning(true);
      setScanningMode('ingredient');

      const {
        ingredientControllerAPI,
      } = require('../../services/API/ingredientControllerAPI');
      const scanResults = await ingredientControllerAPI.scanPhoto(photo.uri);

      if (scanResults && scanResults.length > 0) {
        const confirmedIngredients =
          ingredientControllerAPI.convertScanToConfirmed(
            scanResults,
            'ingredient',
          );

        navigation.navigate('AddItemScreen', {
          fridgeId,
          scanResults: confirmedIngredients,
          scanMode: 'ingredient',
        });
      } else {
        Alert.alert('인식 실패', '식재료 인식 실패, 수동 인식 ㄱㄱ', [
          { text: '수동 입력', onPress: handleManualInput },
          { text: 'cancel', style: 'cancel' },
        ]);
      }
    } catch (error) {
      console.error('식재료 스캔 오류:', error);
      Alert.alert('스캔 오류', '식재료 인식 오류... 수동 입력 ㄱㄱ', [
        {
          text: 'Manual Input',
          onPress: handleManualInput,
        },
        { text: 'cancel', style: 'cancel' },
      ]);
    } finally {
      setIsScanning(false);
      setScanningMode(null);
    }
  }, [photo.uri, fridgeId, navigation]);

  const handleReceiptScan = useCallback(async () => {
    try {
      setIsScanning(true);
      setScanningMode('receipt');

      const {
        ingredientControllerAPI,
      } = require('../../services/API/ingredientControllerAPI');
      const scanResults = await ingredientControllerAPI.scanReceipt(photo.uri);

      if (scanResults && scanResults.length > 0) {
        const confirmedIngredients =
          ingredientControllerAPI.convertScanToConfirmed(
            scanResults,
            'receipt',
          );
        navigation.navigate('AddItemScreen', {
          fridgeId,
          scanResults: confirmedIngredients,
          scanMode: 'receipt',
        });
      } else {
        Alert.alert(
          '인식 실패',
          '영수증에서 식재료 인식 실패... 수동 입력 ㄱㄱ',
          [
            { text: 'Manual Input', onPress: handleManualInput },
            { text: 'cancel', style: 'cancel' },
          ],
        );
      }
    } catch (error) {
      console.error('error : failed scanning receipt : ', error);
      Alert.alert('scanning error', '스캔 중 오류 발생, 수동 입력 ㄱㄱ', [
        { text: 'Manual Input', onPress: handleManualInput },
        { text: 'cancel', style: 'cancel' },
      ]);
    } finally {
      setIsScanning(false);
      setScanningMode(null);
    }
  }, [photo.uri, fridgeId, navigation]);

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

  const formatFileSize = useCallback((bytes?: number): string => {
    if (!bytes) return '';
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }, []);

  const handleRetake = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCancel = useCallback(() => {
    Alert.alert('취소하시겠습니까?', '촬영한 사진이 삭제됩니다.', [
      { text: '계속 편집', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => {
          navigation.goBack();
        },
      },
    ]);
  }, [navigation]);

  const handleUse = useCallback(() => {
    navigation.navigate('AddItemScreen', {
      fridgeId,
      recognizedData: {
        photo: photo.uri,
        name: '인식된 식재료',
        quantity: '1',
        unit: '개',
        expiryDate: '',
        itemCategory: '야채',
      },
    });
  }, [navigation, photo.uri, fridgeId]);

  const handleAutoScan = useCallback(async () => {
    try {
      console.log(`${scanMode} 자동 스캔 시작`);

      const {
        IngredientControllerAPI,
      } = require('../../services/API/ingredientControllerAPI');
      let scanResults;

      if (scanMode === 'ingredient') {
        scanResults = await IngredientControllerAPI.scanPhoto(photo.uri);
      } else {
        scanResults = await IngredientControllerAPI.scanReceipt(photo.uri);
      }

      if (scanResults && scanResults.length > 0) {
        const confirmedIngredients =
          IngredientControllerAPI.convertScanToConfirmed(scanResults, scanMode);

        navigation.navigate('AddItemScreen', {
          fridgeId,
          scanResults: confirmedIngredients,
          scanMode,
        });
      } else {
        // 스캔 실패 시 수동 입력 옵션 제공
        Alert.alert(
          '인식 실패',
          `${
            scanMode === 'ingredient' ? '식재료' : '영수증'
          }에서 항목을 인식할 수 없습니다.\n수동으로 입력하시겠습니까?`,
          [
            { text: '수동 입력', onPress: handleManualInput },
            { text: '다시 촬영', onPress: handleRetake },
          ],
        );
      }
    } catch (error) {
      console.error(`${scanMode} 스캔 오류:`, error);
      Alert.alert(
        '스캔 오류',
        `${
          scanMode === 'ingredient' ? '식재료 인식' : '영수증 스캔'
        } 중 오류가 발생했습니다.`,
        [
          { text: '수동 입력', onPress: handleManualInput },
          { text: '다시 촬영', onPress: handleRetake },
        ],
      );
    }
  }, [photo.uri, scanMode, fridgeId, navigation]);

  return (
    <SafeAreaView style={styles.previewContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#222222" />

      <View style={styles.previewHeader}>
        <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
          <MaterialIcons name="arrow-back-ios-new" size={24} color="#f8f8f8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {scanMode === 'ingredient' ? '식재료 인식 중' : '영수증 분석 중'}
        </Text>
        <View style={styles.rightSection} />
      </View>

      <View style={styles.imageContainer}>
        <View style={styles.imagePlace}>
          <Image
            source={{ uri: photo.uri }}
            style={[styles.previewImage, getImageStyle()]}
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {imageLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#f8f8f8" />
              <Text style={styles.loadingText}>이미지 로딩 중...</Text>
            </View>
          )}

          {!imageLoading && (
            <View style={styles.scanningOverlay}>
              <ActivityIndicator size="large" color="#f8f8f8" />
              <Text style={styles.scanningText}>
                {scanMode === 'ingredient'
                  ? '식재료를 인식하고 있습니다...'
                  : '영수증을 분석하고 있습니다...'}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>
          {scanMode === 'ingredient'
            ? '촬영한 식재료를 자동으로 인식하고 있습니다'
            : '촬영한 영수증에서 식재료를 찾고 있습니다'}
        </Text>
        <Text style={styles.subInfoText}>잠시만 기다려주세요</Text>
      </View>
    </SafeAreaView>
  );
};

export default PhotoPreviewScreen;
