import { Linking } from 'react-native';

export interface InviteInfo {
  token: string;
  fridgeId?: string;
  fridgeName?: string;
  inviterName?: string;
  memberCount?: number;
}

export class DeepLinkHandler {
  private static navigationRef: any = null;

  // 네비게이션 참조 설정
  static setNavigationRef(ref: any) {
    DeepLinkHandler.navigationRef = ref;
  }

  // 딥링크 초기화
  static initialize() {
    // 앱이 종료된 상태에서 URL로 열렸을 때
    Linking.getInitialURL().then(url => {
      if (url) {
        DeepLinkHandler.handleURL(url);
      }
    });

    // 앱이 실행 중일 때 URL로 열렸을 때
    const subscription = Linking.addEventListener('url', ({ url }) => {
      DeepLinkHandler.handleURL(url);
    });

    return subscription;
  }

  // URL 파싱 및 처리
  static handleURL(url: string) {
    // console.log('딥링크 URL 수신:', url);

    try {
      const urlObj = new URL(url);

      // 초대 링크 처리
      if (urlObj.pathname === '/invite' || url.includes('/invite')) {
        DeepLinkHandler.handleInviteLink(urlObj);
      }
      // 다른 딥링크 타입들 추가 가능
    } catch (error) {
      // console.error('딥링크 URL 파싱 실패:', error);
    }
  }

  // 초대 링크 처리
  private static async handleInviteLink(urlObj: URL) {
    const token = urlObj.searchParams.get('token');
    const fridgeId = urlObj.searchParams.get('fridgeId');
    const fridgeName = urlObj.searchParams.get('fridgeName');
    const inviterName = urlObj.searchParams.get('inviterName');
    const memberCount = urlObj.searchParams.get('memberCount');

    if (!token) {
      // console.error('초대 토큰이 없습니다');
      return;
    }

    // 로그인 상태 확인
    const isLoggedIn = await DeepLinkHandler.checkLoginStatus();

    if (!isLoggedIn) {
      // 로그인이 필요한 경우, 로그인 후 초대 화면으로 이동하도록 상태 저장
      await DeepLinkHandler.storePendingInvite({
        token,
        fridgeId: fridgeId || undefined,
        fridgeName: fridgeName || undefined,
        inviterName: inviterName || undefined,
        memberCount: memberCount ? parseInt(memberCount) : undefined,
      });

      DeepLinkHandler.navigateToLogin();
    } else {
      // 이미 로그인된 경우 바로 초대 확인 화면으로
      DeepLinkHandler.navigateToInviteConfirm({
        token,
        fridgeId: fridgeId || undefined,
        fridgeName: fridgeName || undefined,
        inviterName: inviterName || undefined,
        memberCount: memberCount ? parseInt(memberCount) : undefined,
      });
    }
  }

  // 로그인 상태 확인
  private static async checkLoginStatus(): Promise<boolean> {
    try {
      // AsyncStorage에서 현재 사용자 확인
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      const userId = await AsyncStorage.getItem('userId');
      return !!userId;
    } catch (error) {
      // console.error('로그인 상태 확인 실패:', error);
      return false;
    }
  }

  // 대기 중인 초대 정보 저장
  private static async storePendingInvite(inviteInfo: InviteInfo) {
    try {
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('pendingInvite', JSON.stringify(inviteInfo));
    } catch (error) {
      // console.error('대기 중인 초대 저장 실패:', error);
    }
  }

  // 대기 중인 초대 정보 가져오기 및 삭제
  static async getPendingInvite(): Promise<InviteInfo | null> {
    try {
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      const pendingInvite = await AsyncStorage.getItem('pendingInvite');

      if (pendingInvite) {
        await AsyncStorage.removeItem('pendingInvite');
        return JSON.parse(pendingInvite);
      }

      return null;
    } catch (error) {
      // console.error('대기 중인 초대 가져오기 실패:', error);
      return null;
    }
  }

  // 로그인 화면으로 이동
  private static navigateToLogin() {
    if (DeepLinkHandler.navigationRef?.isReady()) {
      DeepLinkHandler.navigationRef.navigate('Login');
    }
  }

  // 초대 확인 화면으로 이동
  private static navigateToInviteConfirm(inviteInfo: InviteInfo) {
    if (DeepLinkHandler.navigationRef?.isReady()) {
      DeepLinkHandler.navigationRef.navigate('InviteConfirm', {
        token: inviteInfo.token,
        fridgeInfo: {
          name: inviteInfo.fridgeName || '냉장고',
          inviterName: inviteInfo.inviterName || '사용자',
          memberCount: inviteInfo.memberCount || 1,
        },
      });
    }
  }
}
