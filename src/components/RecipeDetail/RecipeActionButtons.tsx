import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ConfirmModal from '../modals/ConfirmModal';
import { styles } from './styles';
import { ShareRecipeModal } from './ShareRecipeModal';

// API imports
import { FridgeAPIService } from '../../services/API/fridgeAPI';
import RecipeAPI from '../../services/API/RecipeAPI';

interface CheckableFridge {
  id: number;
  name: string;
  isChecked: boolean;
}

interface RecipeActionButtonsProps {
  isSharedRecipe: boolean;
  recipeId: number | string;
  currentFridgeId: number | string; // 현재 레시피가 속한 냉장고 ID
  onUseRecipe: () => void;
}

export const RecipeActionButtons: React.FC<RecipeActionButtonsProps> = ({
  isSharedRecipe,
  recipeId,
  currentFridgeId,
  onUseRecipe,
}) => {
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [fridges, setFridges] = useState<CheckableFridge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ConfirmModal 상태들
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [noSelectionModalVisible, setNoSelectionModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 냉장고 목록 불러오기
  const loadFridges = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 냉장고 목록 로드 시작...');
      console.log('🔍 현재 냉장고 ID:', currentFridgeId);

      const response = await FridgeAPIService.getFridgeList();
      console.log('🔍 API 응답 상태:', response.status);

      // API 응답 구조 확인
      let fridgeData;
      if (response.ok) {
        const responseData = await response.json();
        console.log('🔍 전체 응답 데이터:', responseData);

        // API 응답 구조에 따라 데이터 추출
        if (responseData.result && Array.isArray(responseData.result)) {
          fridgeData = responseData.result;
        } else if (Array.isArray(responseData)) {
          fridgeData = responseData;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          fridgeData = responseData.data;
        } else {
          // console.warn('⚠️ 예상하지 못한 응답 구조:', responseData);
          fridgeData = [];
        }
      } else {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      console.log('🔍 추출된 냉장고 데이터:', fridgeData);

      if (!Array.isArray(fridgeData)) {
        // console.error('❌ fridgeData가 배열이 아닙니다:', typeof fridgeData);
        fridgeData = [];
      }

      // 현재 냉장고를 제외한 나머지 냉장고들만 공유 대상으로 설정
      const shareableFridges = fridgeData
        .filter((fridge: any) => {
          const fridgeId =
            fridge.id || fridge.refrigeratorId || fridge.fridgeId;
          return fridgeId && fridgeId.toString() !== currentFridgeId;
        })
        .map((fridge: any) => {
          const fridgeId =
            fridge.id || fridge.refrigeratorId || fridge.fridgeId;
          const fridgeName =
            fridge.name ||
            fridge.title ||
            fridge.refrigeratorName ||
            `냉장고 ${fridgeId}`;

          return {
            id: fridgeId,
            name: fridgeName,
            isChecked: false,
          };
        });

      setFridges(shareableFridges);
      console.log('✅ 공유 가능한 냉장고:', shareableFridges.length);
      console.log('🔍 공유 가능한 냉장고 목록:', shareableFridges);
    } catch (error) {
      // console.error('❌ 냉장고 목록 로드 실패:', error);
      setErrorMessage('냉장고 목록을 불러오는데 실패했습니다.');
      setErrorModalVisible(true);
      setFridges([]); // 에러 시 빈 배열로 설정
    } finally {
      setIsLoading(false);
    }
  };

  // 공유 버튼 클릭
  const handleSharePress = async () => {
    await loadFridges();
    setIsShareModalVisible(true);
  };

  // 냉장고 선택/해제
  const handleToggleFridge = (fridgeId: number) => {
    setFridges(prev =>
      prev.map(fridge =>
        fridge.id === fridgeId
          ? { ...fridge, isChecked: !fridge.isChecked }
          : fridge,
      ),
    );
  };

  // 선택된 냉장고들에 레시피 공유
  const handleShareToSelectedFridges = async () => {
    const selectedFridges = fridges.filter(fridge => fridge.isChecked);

    if (selectedFridges.length === 0) {
      setNoSelectionModalVisible(true);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 레시피 공유 시작...', {
        recipeId,
        recipeIdType: typeof recipeId,
        targetFridges: selectedFridges.map(f => f.id),
      });

      // 각 냉장고에 레시피 공유
      const sharePromises = selectedFridges.map(fridge => {
        console.log('🔄 공유 시도:', {
          recipeId,
          fridgeId: fridge.id,
          fridgeIdType: typeof fridge.id,
        });
        return RecipeAPI.shareRecipe(recipeId, fridge.id);
      });

      await Promise.all(sharePromises);

      console.log('✅ 레시피 공유 완료');
      setSuccessMessage(
        `${selectedFridges.length}개의 냉장고에 레시피가 공유되었습니다.`,
      );
      setSuccessModalVisible(true);

      // 선택 상태 초기화
      setFridges(prev => prev.map(fridge => ({ ...fridge, isChecked: false })));
    } catch (error) {
      // console.error('❌ 레시피 공유 실패:', error);
      setErrorMessage('레시피 공유에 실패했습니다.');
      setErrorModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.useRecipeButton,
            isSharedRecipe && styles.fullWidthButton, // ✅ 공유 레시피일 때 전체 너비
          ]}
          onPress={onUseRecipe}
        >
          <Image
            source={require('../../assets/icons/chef_hat_20dp.png')}
            resizeMode="contain"
          />
          <Text style={styles.buttonText}>조리하기</Text>
        </TouchableOpacity>

        {!isSharedRecipe && (
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleSharePress}
            disabled={isLoading}
          >
            <Icon name="group" size={20} color="#666" />
            <Text style={styles.shareButtonText}>
              {isLoading ? '로딩 중...' : '레시피 공유하기'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ShareRecipeModal
        visible={isShareModalVisible}
        fridges={fridges}
        onClose={() => setIsShareModalVisible(false)}
        onToggleFridge={handleToggleFridge}
        onShareToSelectedFridges={handleShareToSelectedFridges}
        isLoading={isLoading}
      />

      {/* 에러 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={errorModalVisible}
        title="오류"
        message={errorMessage}
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={() => setErrorModalVisible(false)}
        onCancel={() => setErrorModalVisible(false)}
      />

      {/* 선택 없음 알림 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={noSelectionModalVisible}
        title="알림"
        message="공유할 냉장고를 선택해주세요."
        iconContainer={{ backgroundColor: '#e8f5e9' }}
        icon={{ name: 'error-outline', color: 'rgba(47, 72, 88, 1)', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="general"
        onConfirm={() => setNoSelectionModalVisible(false)}
        onCancel={() => setNoSelectionModalVisible(false)}
      />

      {/* 공유 성공 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={successModalVisible}
        title="공유 완료"
        message={successMessage}
        iconContainer={{ backgroundColor: '#d3f0d3' }}
        icon={{ name: 'check', color: 'limegreen', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => {
          setSuccessModalVisible(false);
          setIsShareModalVisible(false);
        }}
        onCancel={() => {
          setSuccessModalVisible(false);
          setIsShareModalVisible(false);
        }}
      />
    </>
  );
};
