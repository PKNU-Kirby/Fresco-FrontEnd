import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import {
  launchCamera,
  ImagePickerResponse,
  MediaType,
  PhotoQuality,
} from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../components/common/CustomText';
import PhotoPreview from './PhotoPreview';
import { styles } from './styles';

type CameraScreenRouteProp = RouteProp<RootStackParamList, 'CameraScreen'>;
type CameraScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CameraScreen'
>;

interface CameraScreenProps {
  route: CameraScreenRouteProp;
  navigation: CameraScreenNavigationProp;
}

interface CapturedPhoto {
  uri: string;
  width?: number;
  height?: number;
  fileSize?: number;
  type?: string;
  fileName?: string;
}

const CameraScreen: React.FC = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const route = useRoute<CameraScreenRouteProp>();
  const { fridgeId } = route.params;
  console.log('fridgeId:', fridgeId); // fridgeId 미사용 방지

  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Run Camera
  const openCamera = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 3000,
      maxWidth: 2000,
      quality: 0.8 as PhotoQuality,
      saveToPhotos: false,
      cameraType: 'back',
      presentationStyle: 'fullScreen',
    };
    setIsLoading(true);

    launchCamera(options, (response: ImagePickerResponse) => {
      setIsLoading(false);

      if (response.didCancel) {
        console.log('User canceled Camera5');
        return;
      }

      if (response.errorMessage) {
        console.error('Camera Error', response.errorMessage);
        Alert.alert('Error', "Can't open Camera");
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setCapturedPhoto({
          uri: asset.uri!,
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize,
          type: asset.type,
          fileName: asset.fileName,
        });
      }
    });
  };

  // 사진 다시 촬영
  const retakePhoto = () => {
    setCapturedPhoto(null);
    openCamera();
  };

  const cancelPhoto = () => {
    Alert.alert('취소하시겠습니까?', '촬영한 사진이 삭제됩니다.', [
      { text: '계속 촬영', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => {
          setCapturedPhoto(null);
          navigation.goBack();
        },
      },
    ]);
  };

  const usePhoto = () => {
    if (capturedPhoto) {
      // AddItemScreen으로 사진과 함께 이동
      navigation.navigate('AddItemScreen', {
        fridgeId: 1, // TODO: 실제 fridgeId 전달
        recognizedData: {
          photo: capturedPhoto.uri,
          // TODO: 백엔드 API 결과로 대체
          name: '인식된 식재료',
          quantity: '1',
          unit: '개',
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {capturedPhoto ? (
        // Photo Preview Screen
        <PhotoPreview
          photo={capturedPhoto}
          onRetake={retakePhoto}
          onUse={usePhoto}
          onCancel={cancelPhoto}
          onPhotoUpdate={updatedPhoto => {
            setCapturedPhoto(updatedPhoto);
          }}
          onAdditionalPhoto={newPhoto => {
            console.log('New additional photo:', newPhoto);
          }}
        />
      ) : (
        // Camera Screen
        <View style={styles.cameraLaunchContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={cancelPhoto}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <CustomText style={styles.headerTitle}>식재료 촬영</CustomText>
            <View style={styles.placeholder} />
          </View>

          {/* Center : Camera Button */}
          <View style={styles.centerContent}>
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
              {isLoading ? '카메라 실행 중...' : '카메라로 촬영하기'}
            </CustomText>
          </View>

          {/* Bottom : Guide */}
          <View style={styles.bottomGuide}>
            <CustomText style={styles.guideText}>
              식재료를 카메라로 촬영해주세요
            </CustomText>
            <CustomText style={styles.subGuideText}>
              명확한 사진일수록 정확한 인식이 가능합니다
            </CustomText>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CameraScreen;
