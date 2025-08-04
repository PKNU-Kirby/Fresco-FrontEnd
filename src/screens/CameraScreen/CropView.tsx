import React, { useState, useEffect } from 'react';
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
import { cropViewStyles as styles } from './styles';

// Navigation 타입
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

const CropView: React.FC = () => {
  const navigation = useNavigation<CropViewNavigationProp>();
  const route = useRoute<CropViewRouteProp>();
  const { photoUri, onCropComplete } = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [cropMode, setCropMode] = useState<'free' | 'square' | '4:3' | '16:9'>(
    'free',
  );

  useEffect(() => {
    startCropping();
  }, []);

  // 크롭 시작
  const startCropping = async () => {
    try {
      setIsLoading(true);

      const cropConfig = getCropConfig();

      const croppedImage = await ImageCropPicker.openCropper({
        path: photoUri,
        ...cropConfig,
      });

      // 크롭 완료
      handleCropSuccess(croppedImage.path);
    } catch (error: any) {
      console.error('Crop error:', error);
      if (error?.message !== 'User cancelled image selection') {
        Alert.alert('오류', '이미지 자르기에 실패했습니다.');
      }
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  // 크롭 설정 가져오기
  const getCropConfig = () => {
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
      freeStyleCropEnabled: cropMode === 'free',
    };

    switch (cropMode) {
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
  };

  // crop success
  const handleCropSuccess = (croppedUri: string) => {
    (navigation as any).navigate('PhotoPreview', {
      croppedPhotoUri: croppedUri,
    });
  };

  // change mode to CROP & restart
  const changeCropModeAndRestart = (
    newMode: 'free' | 'square' | '4:3' | '16:9',
  ) => {
    setCropMode(newMode);
    setTimeout(() => {
      startCropping();
    }, 100);
  };

  // Deal Cancel
  const handleCancel = () => {
    Alert.alert('자르기 취소', '이미지 자르기를 취소하시겠습니까?', [
      { text: '계속하기', style: 'cancel' },
      {
        text: '취소',
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="limegreen" />
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>이미지 자르기</CustomText>
        <TouchableOpacity style={styles.doneButton} onPress={startCropping}>
          <CustomText style={styles.doneButtonText}>자르기</CustomText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <CustomText style={styles.instructionText}>
          자르기 비율을 선택하고 '자르기' 버튼을 눌러주세요
        </CustomText>

        {/* Crop Mode Selection */}
        <View style={styles.cropModeContainer}>
          <CustomText style={styles.cropModeTitle}>자르기 비율</CustomText>
          <View style={styles.cropModeButtons}>
            {[
              { mode: 'free' as const, label: '자유' },
              { mode: 'square' as const, label: '정사각형' },
              { mode: '4:3' as const, label: '4:3' },
              { mode: '16:9' as const, label: '16:9' },
            ].map(({ mode, label }) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.cropModeButton,
                  cropMode === mode && styles.cropModeButtonActive,
                ]}
                onPress={() => setCropMode(mode)}
              >
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

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cropButton} onPress={startCropping}>
            <MaterialIcons name="crop" size={24} color="#fff" />
            <CustomText style={styles.cropButtonText}>이미지 자르기</CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => changeCropModeAndRestart(cropMode)}
          >
            <MaterialIcons name="preview" size={20} color="#666" />
            <CustomText style={styles.previewButtonText}>미리보기</CustomText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Guide */}
      <View style={styles.bottomGuide}>
        <CustomText style={styles.guideText}>
          💡 팁: 자르기 화면에서 확대/축소 및 회전이 가능합니다
        </CustomText>
      </View>
    </SafeAreaView>
  );
};

export default CropView;
