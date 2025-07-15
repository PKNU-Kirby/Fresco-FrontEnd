// src/utils/kakaoConfig.ts
import {
  initializeKakaoSDK,
  isKakaoTalkSharingAvailable,
} from '@react-native-kakao/share';

const KAKAO_APP_KEY = '카카오네이티브앱키';

// 카카오 SDK 초기화
export const initKakao = async (): Promise<boolean> => {
  /*
  try {
    await initializeKakaoSDK(KAKAO_APP_KEY);
    console.log('카카오 SDK 초기화 완료');
    return true;
  } catch (error) {
    console.error('카카오 SDK 초기화 실패:', error);
    return false;
  }
  */
};

// 카카오톡 공유 가능 여부 확인
export const checkKakaoAvailability = async (): Promise<boolean> => {
  /*
  try {
    const isAvailable = await isKakaoTalkSharingAvailable();
    console.log('카카오톡 공유 가능 여부:', isAvailable);
    return isAvailable;
  } catch (error) {
    console.error('카카오톡 가용성 확인 실패:', error);
    return false;
  }
  */
};

// 카카오톡 공유 템플릿 생성
export const createInviteTemplate = (
  fridgeName: string,
  inviteLink: string,
  fridgeImageUrl?: string,
) => {
  return {
    objectType: 'feed',
    content: {
      title: `🏠 ${fridgeName} 냉장고 초대`,
      description: `${fridgeName} 냉장고에 초대되었습니다!\n함께 식재료를 관리하고 절약해보세요.`,
      imageUrl: fridgeImageUrl || 'https://fresco.com/welcom.png',
      link: {
        mobileWebUrl: inviteLink,
        webUrl: inviteLink,
      },
    },
    buttons: [
      {
        title: '냉장고 참여하기',
        link: {
          mobileWebUrl: inviteLink,
          webUrl: inviteLink,
        },
      },
      {
        title: '앱 다운로드 하기',
        link: {
          mobileWebUrl: 'https://play.google.com/store/apps/details?id=fresco',
          webUrl: 'https://fresco.com',
        },
      },
    ],
    social: {
      likeCount: 0,
      commentCount: 0,
      sharedCount: 0,
    },
  };
};
