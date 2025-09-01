export * from './auth'; // LoginRequest, LoginResponse, User 등
// export * from './api'; // API 관련 타입들
// export * from './common'; // 공통 타입들

// ============================================================================
// 누락된 타입들 직접 정의
// ============================================================================

// SocialProvider
export type SocialProvider = 'KAKAO' | 'NAVER';

// StoredUserProfil
export interface StoredUserProfile {
  userId: string;
  provider: SocialProvider;
  providerId: string;
  name: string;
  email?: string;
  profileImage?: string;
  fcmToken?: string;
}

// Refrigerator
export interface Refrigerator {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// API Response 타입들
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

// ColorPalette 타입 정의
export interface ColorPalette {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

// ============================================================================
// 냉장고 관련 타입들
// ============================================================================

export interface Fridge {
  id: string;
  name: string;
  ownerId: string;
  members: FridgeMember[];
  createdAt: string;
  updatedAt: string;
}

export interface FridgeMember {
  userId: string;
  role: 'owner' | 'member';
  joinedAt: string;
}

// ============================================================================
// 식품 관련 타입들
// ============================================================================

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  expiryDate: string;
  quantity: number;
  unit: string;
  fridgeId: string;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
  imageUri?: string;
}

export type FoodCategory =
  | '베이커리'
  | '채소 / 과일'
  | '정육 / 계란'
  | '가공식품'
  | '수산 / 건어물'
  | '쌀 / 잡곡'
  | '우유 / 유제품'
  | '건강식품'
  | '장 / 양념 / 소스'
  | '기타';

// ============================================================================
// 레시피 관련 타입들 (업데이트됨)
// ============================================================================

export interface Recipe {
  id: string;
  title: string;
  ingredients: RecipeIngredient[];
  instructions?: string[];
  steps?: string[] | string;
  servings?: number;
  imageUrl?: string;
  tags?: string[];
  createdBy?: string;
  createdAt?: string;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}
// UseRecipeScreen 전용 타입들
export interface MatchedIngredientSeparate {
  recipeIngredient: {
    name: string;
    quantity: string;
  };
  fridgeIngredient: FridgeItem | null;
  isAvailable: boolean;
  userInputQuantity: string;
  maxUserQuantity: number;
  isDeducted: boolean;
  isCompletelyConsumed?: boolean;
  isMultipleOption?: boolean;
  optionIndex?: number;
}

// FridgeItem 타입 (fridgeStorage에서 사용)
export interface FridgeItem {
  id: string;
  name: string;
  quantity: string;
  unit?: string;
  expiryDate?: string;
  category?: string;
  fridgeId: string;
  addedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 레시피 네비게이션 타입들
export type RecipeStackParamList = {
  RecipeList: { fridgeId: number; fridgeName: string };
  UseRecipe: {
    recipe: Recipe;
    fridgeId: number;
  };
  // 다른 레시피 관련 스크린들...
};

// ============================================================================
// React Navigation 관련 타입들
// ============================================================================

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  FridgeSelect: undefined;
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
    userRole: 'owner' | 'member';
  };
  UsageHistoryScreen: { fridgeId: string };
};

export type MainTabParamList = {
  FridgeHomeScreen: { fridgeId: string; fridgeName: string };
  Recipe: { fridgeId: string; fridgeName: string };
  ShoppingListScreen: { fridgeId: string; fridgeName: string };
};

export type NavigationProps<T extends keyof RootStackParamList> = {
  navigation: any;
  route: {
    params: RootStackParamList[T];
  };
};

// ============================================================================
// React Component Props 타입들
// ============================================================================

export interface BaseComponentProps {
  testID?: string;
  accessibilityLabel?: string;
  style?: any;
}

export interface LoadingComponentProps extends BaseComponentProps {
  loading?: boolean;
  loadingText?: string;
}

export interface ErrorComponentProps extends BaseComponentProps {
  error?: string | null;
  onRetry?: () => void;
}

// ============================================================================
// Context API 타입들
// ============================================================================

export interface AuthContextType {
  user: StoredUserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (provider: SocialProvider, token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

export interface RefrigeratorContextType {
  currentRefrigerator: Refrigerator | null;
  refrigerators: Refrigerator[];
  currentUserRole: 'owner' | 'member' | null;
  isLoading: boolean;
  selectRefrigerator: (
    refrigerator: Refrigerator,
    userRole: 'owner' | 'member',
  ) => void;
  updateRefrigeratorList: (refrigerators: Refrigerator[]) => void;
  addRefrigerator: (refrigerator: Refrigerator) => void;
  updateRefrigerator: (refrigerator: Refrigerator) => void;
  removeRefrigerator: (id: string) => void;
  clearCurrentRefrigerator: () => void;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  colors: ColorPalette;
  toggleTheme: () => void;
}

// ============================================================================
// 커스텀 훅 타입들
// ============================================================================

export interface UseAsyncStateReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export interface UseAuthReturn extends AuthContextType {
  checkAuthStatus: () => Promise<boolean>;
  clearAuthData: () => Promise<void>;
}

export interface UseRefrigeratorReturn extends RefrigeratorContextType {
  // 추가 유틸리티
}

// ============================================================================
// 에러 처리 타입들
// ============================================================================

export class AppError extends Error {
  code: string;
  statusCode?: number;
  isOperational: boolean;

  constructor(
    message: string,
    code: string,
    statusCode?: number,
    isOperational = true,
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Error.captureStackTrace가 있는 환경에서만 호출
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// ============================================================================
// 타입 가드 함수들
// ============================================================================

export const isApiSuccessResponse = (
  response: any,
): response is ApiSuccessResponse => {
  return (
    response &&
    typeof response.code === 'string' &&
    response.code.includes('OK')
  );
};

export const isApiErrorResponse = (
  response: any,
): response is ApiErrorResponse => {
  return (
    response &&
    typeof response.code === 'string' &&
    response.code.includes('ERR')
  );
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone);
};

export const isOwner = (role: string | null): role is 'owner' => {
  return role === 'owner';
};

export const isMember = (role: string | null): role is 'member' => {
  return role === 'member';
};

export const isPendingInvitation = (status: string): boolean => {
  return status === 'PENDING';
};

// ============================================================================
// 유틸리티 상수들
// ============================================================================

export const INGREDIENT_UNITS = ['개', 'g', 'kg', 'ml', 'L'] as const;
export type IngredientUnit = (typeof INGREDIENT_UNITS)[number];

export const REFRIGERATOR_ROLES = {
  OWNER: 'owner' as const,
  MEMBER: 'member' as const,
};

export const INVITATION_STATUS = {
  PENDING: 'PENDING' as const,
  ACCEPTED: 'ACCEPTED' as const,
  DECLINED: 'DECLINED' as const,
  EXPIRED: 'EXPIRED' as const,
};
