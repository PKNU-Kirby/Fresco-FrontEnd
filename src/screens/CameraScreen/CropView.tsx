// screens/CameraScreen/CropView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ImageCropPicker from 'react-native-image-crop-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../components/common/CustomText';
import { cropStyles as styles } from './styles';

type RootStackParamList = {
  CropView: {
    photoUri: string;
    onCropComplete: (croppedUri: string) => void;
  };
};

type CropViewRouteProp = RouteProp<RootStackParamList, 'CropView'>;
type CropViewNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CropView'
>;

type CropMode = 'free' | 'square' | '4:3' | '16:9';

const CropView: React.FC = () => {
  const navigation = useNavigation<CropViewNavigationProp>();
  const route = useRoute<CropViewRouteProp>();
  const { photoUri } = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [cropMode, setCropMode] = useState<CropMode>('free');

  const cropModeOptions = [
    { mode: 'free' as const, label: '자유', icon: 'crop-free' },
    { mode: 'square' as const, label: '정사각형', icon: 'crop-square' },
    { mode: '4:3' as const, label: '4:3', icon: 'crop-landscape' },
    { mode: '16:9' as const, label: '16:9', icon: 'crop-16-9' },
  ];

  const getCropConfig = useCallback((mode: CropMode) => {
    const baseConfig = {
      mediaType: 'photo' as const,
      cropping: true,
      cropperCircleOverlay: false,
      compressImageMaxWidth: 1000,
      compressImageMaxHeight: 1000,
      compressImageQuality: 0.8,
      includeBase64: false,
      enableRotationGesture: true,
      showCropGuidelines: true,
      showCropFrame: true,
      hideBottomControls: false,
      freeStyleCropEnabled: mode === 'free',
    };

    switch (mode) {
      case 'square':
        return {
          ...baseConfig,
          width: 800,
          height: 800,
          freeStyleCropEnabled: false,
        };
      case '4:3':
        return {
          ...baseConfig,
          width: 800,
          height: 600,
          freeStyleCropEnabled: false,
        };
      case '16:9':
        return {
          ...baseConfig,
          width: 800,
          height: 450,
          freeStyleCropEnabled: false,
        };
      default:
        return baseConfig;
    }
  }, []);

  const startCropping = useCallback(async () => {
    try {
      setIsLoading(true);
      const cropConfig = getCropConfig(cropMode);

      const croppedImage = await ImageCropPicker.openCropper({
        path: photoUri,
        ...cropConfig,
      });

      (navigation as any).navigate('PhotoPreview', {
        croppedPhotoUri: croppedImage.path,
      });
    } catch (error: any) {
      console.error('Crop error:', error);

      if (error?.message !== 'User cancelled image selection') {
        Alert.alert('오류', '이미지 자르기에 실패했습니다.');
      }

      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [photoUri, cropMode, getCropConfig, navigation]);

  const changeCropModeAndRestart = useCallback(
    (newMode: CropMode) => {
      setCropMode(newMode);
      setTimeout(() => {
        startCropping();
      }, 100);
    },
    [startCropping],
  );

  const handleCancel = useCallback(() => {
    Alert.alert('자르기 취소', '이미지 자르기를 취소하시겠습니까?', [
      { text: '계속하기', style: 'cancel' },
      {
        text: '취소',
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(startCropping, 500);
    return () => clearTimeout(timer);
  }, [startCropping]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <CustomText style={styles.loadingText}>
            이미지를 처리하는 중...
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
          accessibilityLabel="취소"
          accessibilityRole="button"
        >
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>이미지 자르기</CustomText>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={startCropping}
          accessibilityLabel="자르기 시작"
          accessibilityRole="button"
        >
          <CustomText style={styles.doneButtonText}>자르기</CustomText>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <CustomText style={styles.instructionText}>
          자르기 비율을 선택하고 '자르기' 버튼을 눌러주세요
        </CustomText>

        <View style={styles.cropModeContainer}>
          <CustomText style={styles.cropModeTitle}>자르기 비율</CustomText>
          <View style={styles.cropModeButtons}>
            {cropModeOptions.map(({ mode, label, icon }) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.cropModeButton,
                  cropMode === mode && styles.cropModeButtonActive,
                ]}
                onPress={() => setCropMode(mode)}
                accessibilityLabel={`${label} 비율로 자르기`}
                accessibilityRole="button"
              >
                <MaterialIcons
                  name={icon as any}
                  size={16}
                  color={cropMode === mode ? '#fff' : '#999'}
                />
                <CustomText
                  style={[
                    styles.cropModeButtonText,
                    cropMode === mode && styles.cropModeButtonTextActive,
                  ]}
                >
                  {label}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cropButton}
            onPress={startCropping}
            accessibilityLabel="이미지 자르기 시작"
            accessibilityRole="button"
          >
            <MaterialIcons name="crop" size={24} color="#fff" />
            <CustomText style={styles.cropButtonText}>이미지 자르기</CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => changeCropModeAndRestart(cropMode)}
            accessibilityLabel="현재 설정으로 미리보기"
            accessibilityRole="button"
          >
            <MaterialIcons name="preview" size={20} color="#666" />
            <CustomText style={styles.previewButtonText}>미리보기</CustomText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomGuide}>
        <CustomText style={styles.guideText}>
          💡 팁: 자르기 화면에서 확대/축소 및 회전이 가능합니다
        </CustomText>
      </View>
    </SafeAreaView>
  );
};

export default CropView;
