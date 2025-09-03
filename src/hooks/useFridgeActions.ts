import { useState } from 'react';
import {
  AsyncStorageService,
  FridgeWithRole,
} from '../services/AsyncStorageService';
import Config from 'react-native-config';
import { useLogout } from './Auth/useLogout';
import {
  createRefrigerator,
  updateRefrigerator,
  deleteRefrigerator,
} from '../types/api';
import { User } from '../types/auth';
import { getValidAccessToken } from '../utils/authUtils';

interface UseFridgeActionsParams {
  currentUser: User | null;
  loadUserFridges: () => Promise<void>;
  setEditingFridge: (fridge: FridgeWithRole | null) => void;
  setIsEditModalVisible: (visible: boolean) => void;
  setIsAddModalVisible: (visible: boolean) => void;
  editingFridge: FridgeWithRole | null;
  navigation: any;
}

export const useFridgeActions = ({
  currentUser,
  loadUserFridges,
  setEditingFridge,
  setIsEditModalVisible,
  setIsAddModalVisible,
  editingFridge,
  navigation,
}: UseFridgeActionsParams) => {
  // 모달 상태들
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [leaveConfirmVisible, setLeaveConfirmVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [notOwnerModalVisible, setNotOwnerModalVisible] = useState(false);
  const [hideToggleModalVisible, setHideToggleModalVisible] = useState(false);

  // 삭제 처리 중 상태 추가
  const [isDeletingFridge, setIsDeletingFridge] = useState(false);

  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [selectedFridge, setSelectedFridge] = useState<FridgeWithRole | null>(
    null,
  );

  // useLogout 훅 사용
  const { isLoggingOut, handleLogout: performLogout } = useLogout();

  const handleLogout = () => {
    setLogoutConfirmVisible(true);
  };

  const handleLogoutConfirm = async () => {
    setLogoutConfirmVisible(false);
    await performLogout();
  };

  const handleEditFridge = (fridge: FridgeWithRole) => {
    if (!fridge.isOwner) {
      setNotOwnerModalVisible(true);
      return;
    }
    setEditingFridge(fridge);
    setIsEditModalVisible(true);
  };

  const handleLeaveFridge = (fridge: FridgeWithRole) => {
    if (!currentUser) return;

    setSelectedFridge(fridge);
    if (fridge.isOwner) {
      setDeleteConfirmVisible(true);
    } else {
      setLeaveConfirmVisible(true);
    }
  };

  // 500 에러 후속 처리 함수
  const handleDelete500Recovery = async () => {
    if (!selectedFridge) return;

    try {
      console.log('500 에러 후 실제 삭제 상태 확인 중...');

      // 전체 냉장고 목록을 서버에서 다시 가져와서 확인
      const token = await getValidAccessToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다');
      }

      const checkResponse = await fetch(
        `${Config.API_BASE_URL}/api/v1/refrigerator`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (checkResponse.ok) {
        const data = await checkResponse.json();
        console.log('삭제 후 냉장고 목록:', data);

        // 삭제하려던 냉장고가 목록에 있는지 확인
        const fridgeStillExists = data.result?.some(
          (fridge: any) => fridge.id.toString() === selectedFridge.id,
        );

        setSuccessModalVisible(false); // 이전 모달 닫기

        if (!fridgeStillExists) {
          // 실제로 삭제됨
          console.log('500 에러였지만 실제로는 삭제 성공');
          await AsyncStorageService.deleteRefrigerator(
            parseInt(selectedFridge.id, 10),
          );

          setModalTitle('삭제 완료');
          setModalMessage(
            '냉장고가 성공적으로 삭제되었습니다.\n(서버 처리에 시간이 걸렸습니다)',
          );
          setSuccessModalVisible(true);
        } else {
          // 여전히 존재함
          console.log('500 에러 후 확인 결과: 삭제되지 않음');
          setModalTitle('삭제 실패');
          setModalMessage(
            '서버 오류로 인해 냉장고를 삭제할 수 없습니다.\n\n이 문제는 백엔드 수정이 필요합니다.',
          );
          setErrorModalVisible(true);
        }
      } else {
        // 목록 조회도 실패
        console.log('냉장고 목록 조회 실패:', checkResponse.status);
        setSuccessModalVisible(false);
        setModalTitle('확인 불가');
        setModalMessage(
          '삭제 결과를 확인할 수 없습니다.\n목록이 새로고침되었습니다.',
        );
        setErrorModalVisible(true);
      }
    } catch (error) {
      console.error('500 에러 후속 처리 실패:', error);
      setSuccessModalVisible(false);
      setModalTitle('확인 오류');
      setModalMessage(
        '삭제 결과 확인 중 오류가 발생했습니다.\n목록을 새로고침했습니다.',
      );
      setErrorModalVisible(true);
    } finally {
      // 항상 목록 새로고침
      await loadUserFridges();
    }
  };

  // 개선된 냉장고 삭제 처리
  const handleDeleteConfirm = async () => {
    if (!selectedFridge || isDeletingFridge) return;

    setDeleteConfirmVisible(false);
    setIsDeletingFridge(true);

    // 백엔드 디버깅을 위한 로그 출력
    console.log('=== 백엔드 개발자용 디버그 정보 ===');
    console.log('문제 냉장고 ID:', selectedFridge.id);
    console.log('현재 사용자 ID:', currentUser?.id);
    console.log('에러 발생 시각:', new Date().toISOString());
    console.log(
      `요청 URL: DELETE ${Config.API_BASE_URL}/api/v1/refrigerator/` +
        selectedFridge.id,
    );
    console.log('=====================================');

    try {
      console.log('=== 냉장고 삭제 프로세스 시작 ===');
      console.log('삭제할 냉장고:', selectedFridge);

      // 서버 삭제 시도
      console.log('서버에 삭제 요청 중...');
      const response = await deleteRefrigerator(selectedFridge.id);

      // 성공한 경우
      console.log('서버 삭제 성공:', response);

      // 성공 응답 확인
      if (
        response.code === 'FRIDGE_OK_002' ||
        response.result ||
        response.success
      ) {
        await AsyncStorageService.deleteRefrigerator(
          parseInt(selectedFridge.id, 10),
        );

        setModalTitle('삭제 완료');
        setModalMessage('냉장고가 성공적으로 삭제되었습니다.');
        setSuccessModalVisible(true);
      } else {
        console.warn('예상치 못한 응답 형식:', response);
        setModalTitle('응답 확인 필요');
        setModalMessage(
          '삭제 요청이 전송되었지만 응답을 확인할 수 없습니다.\n목록을 새로고침합니다.',
        );
        setErrorModalVisible(true);
      }
    } catch (error: any) {
      console.error('서버 삭제 실패:', error);

      if (error.status === 500) {
        console.log('500 에러 감지 - 실제 삭제 여부 확인 예정');

        // 사용자에게는 처리 중이라고 안내
        setModalTitle('처리 중');
        setModalMessage(
          '서버에서 삭제를 처리하고 있습니다.\n잠시 후 결과를 확인합니다...',
        );
        setSuccessModalVisible(true);

        // 3초 후 실제 삭제 여부 확인
        setTimeout(async () => {
          await handleDelete500Recovery();
        }, 3000);

        return; // 여기서 함수 종료, setTimeout에서 후속 처리
      } else if (error.status === 404) {
        // 이미 삭제된 경우
        setModalTitle('이미 삭제됨');
        setModalMessage('냉장고가 이미 삭제되었습니다.');
        setSuccessModalVisible(true);
      } else if (error.status === 403) {
        setModalTitle('권한 없음');
        setModalMessage('이 냉장고를 삭제할 권한이 없습니다.');
        setErrorModalVisible(true);
      } else {
        setModalTitle('삭제 실패');
        setModalMessage(
          `삭제에 실패했습니다.\n\n${error.message || '알 수 없는 오류'}`,
        );
        setErrorModalVisible(true);
      }
    } finally {
      // 500 에러가 아닌 경우에만 여기서 정리
      if (!error || error.status !== 500) {
        await loadUserFridges(); // 서버 상태와 동기화
        setIsDeletingFridge(false);
        setSelectedFridge(null);
      }
    }
  };

  const handleLeaveConfirm = async () => {
    if (!currentUser || !selectedFridge) return;

    setLeaveConfirmVisible(false);
    try {
      // TODO: 서버에 냉장고 나가기 API 추가 시 구현
      // await removeUserFromRefrigerator(selectedFridge.id, currentUser.id);

      // 현재는 로컬 로직만 사용
      const success = await AsyncStorageService.removeUserFromRefrigerator(
        parseInt(selectedFridge.id, 10),
        parseInt(currentUser.id, 10),
      );

      if (success) {
        await loadUserFridges();
        setModalTitle('성공');
        setModalMessage('냉장고에서 나왔습니다.');
        setSuccessModalVisible(true);
      } else {
        setModalTitle('오류');
        setModalMessage('냉장고 나가기에 실패했습니다.');
        setErrorModalVisible(true);
      }
    } catch (error) {
      console.error('냉장고 나가기 실패:', error);
      setModalTitle('오류');
      setModalMessage('냉장고 나가기에 실패했습니다.');
      setErrorModalVisible(true);
    }
    setSelectedFridge(null);
  };

  const handleToggleHidden = async (fridge: FridgeWithRole) => {
    if (!currentUser) return;

    try {
      // 숨김 토글은 로컬 설정이므로 기존 로직 유지
      await AsyncStorageService.setFridgeHidden(
        parseInt(currentUser.id, 10),
        parseInt(fridge.id, 10),
        !fridge.isHidden,
      );
      await loadUserFridges();

      const message = fridge.isHidden
        ? '냉장고를 표시했습니다.'
        : '냉장고를 숨겼습니다.';
      setModalTitle('성공');
      setModalMessage(message);
      setHideToggleModalVisible(true);
    } catch (error) {
      console.error('냉장고 숨김 토글 실패:', error);
      setModalTitle('오류');
      setModalMessage('냉장고 숨김 설정에 실패했습니다.');
      setErrorModalVisible(true);
    }
  };

  // 냉장고 생성
  const handleAddFridge = async (fridgeData: { name: string }) => {
    if (!currentUser) return;

    try {
      console.log('서버에 냉장고 생성 요청...');

      // 1. 서버 API 호출
      const response = await createRefrigerator(fridgeData.name);
      console.log('서버에서 냉장고 생성 성공:', response);

      // 2. 서버 응답 확인 후 로컬에 동기화 (선택사항)
      if (response.code === 'FRIDGE_OK_002' && response.result) {
        // 서버에서 반환된 실제 데이터로 로컬 동기화
        const serverFridge = response.result;
        await AsyncStorageService.createRefrigerator(
          serverFridge.name,
          parseInt(currentUser.id, 10),
          serverFridge.id, // 서버 ID 사용
        );
      }

      // 3. 서버에서 최신 데이터 다시 로드
      await loadUserFridges();

      setModalTitle('성공');
      setModalMessage('새 냉장고가 생성되었습니다.');
      setSuccessModalVisible(true);
      setIsAddModalVisible(false);
    } catch (error) {
      console.error('냉장고 생성 API 실패:', error);
      setModalTitle('오류');
      setModalMessage('냉장고 생성에 실패했습니다.');
      setErrorModalVisible(true);
    }
  };

  // 냉장고 수정
  const handleUpdateFridge = async (updatedData: { name: string }) => {
    if (!currentUser || !editingFridge) return;

    try {
      console.log('서버에 냉장고 수정 요청...');
      console.log('냉장고 ID:', editingFridge.id);
      console.log('수정 데이터:', updatedData);

      // 1. 서버 API 호출
      const response = await updateRefrigerator(editingFridge.id, {
        name: updatedData.name,
      });
      console.log('서버에서 냉장고 수정 성공:', response);

      // 2. 서버 응답 확인 후 로컬에 동기화 (선택사항)
      if (response.code === 'FRIDGE_OK_002' && response.result) {
        await AsyncStorageService.updateRefrigerator(
          parseInt(editingFridge.id, 10),
          { name: updatedData.name },
        );
      }

      // 3. 서버에서 최신 데이터 다시 로드
      await loadUserFridges();

      setModalTitle('성공');
      setModalMessage('냉장고 정보가 업데이트되었습니다.');
      setSuccessModalVisible(true);
      setIsEditModalVisible(false);
      setEditingFridge(null);
    } catch (error) {
      console.error('냉장고 수정 전체 프로세스 실패:', error);

      // 더 자세한 에러 정보 로깅
      if (error.message?.includes('HTTP error')) {
        console.error('HTTP 에러 상세:', error.message);
      }
      if (error.response) {
        console.error('응답 상태:', error.response.status);
        console.error('응답 데이터:', error.response.data);
      }

      setModalTitle('오류');
      setModalMessage('냉장고 정보 업데이트에 실패했습니다.');
      setErrorModalVisible(true);
    }
  };

  return {
    handleLogout,
    handleEditFridge,
    handleLeaveFridge,
    handleToggleHidden,
    handleAddFridge,
    handleUpdateFridge,
    isLoggingOut,
    isDeletingFridge, // 삭제 중 상태 추가
    // 모달 상태, 핸들러
    modals: {
      logoutConfirmVisible,
      deleteConfirmVisible,
      leaveConfirmVisible,
      successModalVisible,
      errorModalVisible,
      notOwnerModalVisible,
      hideToggleModalVisible,
      modalMessage,
      modalTitle,
      selectedFridge,
    },
    modalHandlers: {
      setLogoutConfirmVisible,
      setDeleteConfirmVisible,
      setLeaveConfirmVisible,
      setSuccessModalVisible,
      setErrorModalVisible,
      setNotOwnerModalVisible,
      setHideToggleModalVisible,
      handleLogoutConfirm,
      handleDeleteConfirm,
      handleLeaveConfirm,
    },
  };
};
