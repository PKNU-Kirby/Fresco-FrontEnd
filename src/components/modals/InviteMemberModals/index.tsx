// components/modals/InviteMemberModals.tsx
import React from 'react';
import ConfirmModal from '../ConfirmModal';

interface InviteMemberModalsProps {
  // Error Modal
  errorModalVisible: boolean;
  setErrorModalVisible: (visible: boolean) => void;
  errorMessage: string;

  // Success Modal
  successModalVisible: boolean;
  setSuccessModalVisible: (visible: boolean) => void;
  successMessage: string;

  // Regenerate Confirm Modal
  regenerateConfirmVisible: boolean;
  setRegenerateConfirmVisible: (visible: boolean) => void;
  onRegenerateConfirm: () => void;

  // SMS Related Modals
  smsNotSupportedVisible: boolean;
  setSmsNotSupportedVisible: (visible: boolean) => void;
  smsFailedVisible: boolean;
  setSmsFailedVisible: (visible: boolean) => void;

  // KakaoTalk Related Modals
  kakaoNotInstalledVisible: boolean;
  setKakaoNotInstalledVisible: (visible: boolean) => void;
  kakaoFailedVisible: boolean;
  setKakaoFailedVisible: (visible: boolean) => void;
  onKakaoFallbackToGeneral: () => void;

  // General Share Failed Modal
  shareFailedVisible: boolean;
  setShareFailedVisible: (visible: boolean) => void;
}

const InviteMemberModals: React.FC<InviteMemberModalsProps> = ({
  errorModalVisible,
  setErrorModalVisible,
  errorMessage,
  successModalVisible,
  setSuccessModalVisible,
  successMessage,
  regenerateConfirmVisible,
  setRegenerateConfirmVisible,
  onRegenerateConfirm,
  smsNotSupportedVisible,
  setSmsNotSupportedVisible,
  smsFailedVisible,
  setSmsFailedVisible,
  kakaoNotInstalledVisible,
  setKakaoNotInstalledVisible,
  kakaoFailedVisible,
  setKakaoFailedVisible,
  onKakaoFallbackToGeneral,
  shareFailedVisible,
  setShareFailedVisible,
}) => {
  return (
    <>
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

      {/* 성공 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={successModalVisible}
        title="완료"
        message={successMessage}
        iconContainer={{ backgroundColor: '#d3f0d3' }}
        icon={{ name: 'check', color: 'limegreen', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="primary"
        onConfirm={() => setSuccessModalVisible(false)}
        onCancel={() => setSuccessModalVisible(false)}
      />

      {/* 초대 링크 재생성 확인 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={regenerateConfirmVisible}
        title="초대 링크 재생성"
        message="새로운 초대 링크를 생성하시겠습니까?\n기존 링크는 더 이상 사용할 수 없습니다."
        iconContainer={{ backgroundColor: '#e8f5e9' }}
        icon={{ name: 'error-outline', color: 'rgba(47, 72, 88, 1)', size: 48 }}
        confirmText="생성"
        cancelText="취소"
        confirmButtonStyle="general"
        onConfirm={onRegenerateConfirm}
        onCancel={() => setRegenerateConfirmVisible(false)}
      />

      {/* SMS 지원 안함 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={smsNotSupportedVisible}
        title="SMS 지원 안함"
        message="이 기기에서는 SMS를 지원하지 않습니다."
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={() => setSmsNotSupportedVisible(false)}
        onCancel={() => setSmsNotSupportedVisible(false)}
      />

      {/* SMS 공유 실패 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={smsFailedVisible}
        title="SMS 공유 실패"
        message="SMS 공유에 실패했습니다."
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={() => setSmsFailedVisible(false)}
        onCancel={() => setSmsFailedVisible(false)}
      />

      {/* 카카오톡 미설치 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={kakaoNotInstalledVisible}
        title="카카오톡 미설치"
        message="카카오톡이 설치되어 있지 않습니다. 다른 방법으로 공유하시겠습니까?"
        iconContainer={{ backgroundColor: '#e8f5e9' }}
        icon={{ name: 'error-outline', color: 'rgba(47, 72, 88, 1)', size: 48 }}
        confirmText="웹 공유"
        cancelText="취소"
        confirmButtonStyle="general"
        onConfirm={() => {
          setKakaoNotInstalledVisible(false);
          onKakaoFallbackToGeneral();
        }}
        onCancel={() => setKakaoNotInstalledVisible(false)}
      />

      {/* 카카오톡 공유 실패 모달 */}
      <ConfirmModal
        isAlert={true}
        visible={kakaoFailedVisible}
        title="공유 실패"
        message="카카오톡 공유에 실패했습니다. 다른 방법으로 공유하시겠습니까?"
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="웹 공유"
        cancelText="취소"
        confirmButtonStyle="danger"
        onConfirm={() => {
          setKakaoFailedVisible(false);
          onKakaoFallbackToGeneral();
        }}
        onCancel={() => setKakaoFailedVisible(false)}
      />

      {/* 일반 공유 실패 모달 */}
      <ConfirmModal
        isAlert={false}
        visible={shareFailedVisible}
        title="공유 실패"
        message="공유에 실패했습니다."
        iconContainer={{ backgroundColor: '#FFE5E5' }}
        icon={{ name: 'error-outline', color: '#FF6B6B', size: 48 }}
        confirmText="확인"
        cancelText=""
        confirmButtonStyle="danger"
        onConfirm={() => setShareFailedVisible(false)}
        onCancel={() => setShareFailedVisible(false)}
      />
    </>
  );
};

export default InviteMemberModals;
