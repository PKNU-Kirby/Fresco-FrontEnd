export type SocialProvider = 'KAKAO' | 'NAVER';

// ============================================================================
// ERD 기반 User 테이블 타입들
// ============================================================================

export interface User {
  id: string; // BIGINT -> string으로 처리 (실제 DB의 사용자 ID)
  provider: SocialProvider; // ENUM('KAKAO', 'NAVER')
  providerId: string; // VARCHAR(30) - 소셜 제공자의 고유 ID
  name: string; // VARCHAR(20) - 사용자 이름
  fcmToken?: string; // VARCHAR(255) - FCM 토큰 (nullable)
  createdAt: string; // TIMESTAMP - 생성 시간
  updatedAt: string; // TIMESTAMP - 변경 시간
}

// ============================================================================
// 소셜 로그인 Profile 타입들
// ============================================================================

// Kakao Profile types
export interface KakaoProfile {
  id: number;
  nickname?: string;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
  };
}

// Kakao Token types
export interface KakaoToken {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scopes?: string[];
}

// Naver Profile types (실제 API 응답에 맞춤)
export interface NaverProfile {
  id: string;
  nickname?: string | null;
  name?: string | null;
  email?: string | null;
  gender?: 'F' | 'M' | null;
  age?: string | null;
  birthday?: string | null;
  profile_image?: string | null;
  birthyear?: number | null;
  mobile?: string | null;
  mobile_e164?: string | null;
}

// ============================================================================
// API Request / Response 타입들
// ============================================================================

// Login Request (ERD provider + providerId 기반)
export interface LoginRequest {
  provider: SocialProvider;
  accessToken: string; // 소셜 로그인에서 받은 access token
}

// Login Response
export interface LoginResponse {
  code: string;
  message: string;
  result: {
    userId: string; // 실제 DB의 사용자 ID
    accessToken: string;
    refreshToken: string;
    user?: User; // 사용자 정보 (선택적)
  };
}

// Refresh Request
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Refresh Response
export interface RefreshTokenResponse {
  code: string;
  message: string;
  result: {
    accessToken: string;
    refreshToken: string;
  };
}

// Logout Response
export interface LogoutResponse {
  code: string;
  message: string;
  result: boolean;
}

// ============================================================================
// Storage 관련 타입들
// ============================================================================

// Local Storage Key types
export type StorageKey =
  | 'userId'
  | 'userProvider'
  | 'userProviderId'
  | 'userName'
  | 'userEmail'
  | 'userProfileImage'
  | 'userFcmToken'
  | 'userProfile'
  | 'accessToken'
  | 'refreshToken';

// ERD 기반 저장될 사용자 정보
export interface StoredUserProfile {
  userId: string; // 실제 DB의 사용자 ID (서버에서 받음)
  provider: SocialProvider;
  providerId: string; // 소셜 제공자의 고유 ID
  name: string;
  email?: string;
  profileImage?: string;
  fcmToken?: string;
}

// ============================================================================
// Component Props 타입들
// ============================================================================

// 기본 로그인 버튼 Props (개선된 버전)
export interface LoginButtonProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  saveUserDataAndNavigate: (
    provider: SocialProvider,
    providerId: string,
    name: string,
    email?: string,
    profileImage?: string,
  ) => Promise<void>;
  showErrorAlert: (message: string) => void;
}

// ============================================================================
// 유틸리티 타입들
// ============================================================================

export type UserId = string;

// API Response 공통 타입
export interface ApiSuccessResponse<T = any> {
  code: string;
  message: string;
  result: T;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  error?: any;
}

// ============================================================================
// Auth State 관리 타입들 (Context나 Redux 사용 시)
// ============================================================================

export interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: StoredUserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
}

export type AuthAction =
  | { type: 'LOGIN_START' }
  | {
      type: 'LOGIN_SUCCESS';
      payload: {
        user: StoredUserProfile;
        accessToken: string;
        refreshToken: string;
      };
    }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | {
      type: 'TOKEN_REFRESH_SUCCESS';
      payload: { accessToken: string; refreshToken: string };
    }
  | { type: 'TOKEN_REFRESH_FAILURE' }
  | { type: 'CLEAR_ERROR' };

// ============================================================================
// Navigation 타입들
// ============================================================================

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  FridgeSelect: undefined;
  InviteConfirm: {
    token: string;
    fridgeInfo: {
      name: string;
      inviterName: string;
      memberCount?: number;
    };
  };
  MainTabs: { fridgeId: string; fridgeName: string };
  AddItemScreen: {
    fridgeId: string;
    recognizedData?: {
      name?: string;
      quantity?: string;
      unit?: string;
      expiryDate?: string;
      itemCategory?: string;
      photo?: string;
    };
  };
  CameraScreen: {
    fridgeId: string;
  };
  PhotoPreview: {
    photo: {
      uri: string;
      width?: number;
      height?: number;
      fileSize?: number;
      type?: string;
      fileName?: string;
    };
    fridgeId: string;
  };
  FridgeSettings: {
    fridgeId: string;
    fridgeName: string;
    userRole: 'owner' | 'member'; // 권한에 따른 UI 분리
  };
  UsageHistoryScreen: { fridgeId: number };
  NotificationSettingsScreen: {};
};

// ============================================================================
// Error 타입들
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface HttpError extends Error {
  status: number;
  statusText: string;
  response?: any;
}
