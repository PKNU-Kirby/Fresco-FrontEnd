// Utils types
// ============================================================================

// types : optional fields
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// types : required fields
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonNullable<T> = T extends null | undefined ? never : T;

// ID types
// ============================================================================

export type ID = string; // BIGINT -> string으로 처리
export type UserId = string; // 사용자 ID
export type RefrigeratorId = string; // 냉장고 ID
export type GroceryListId = string; // 장바구니 ID
export type HistoryId = string; // 사용 내역 ID
export type RefrigeratorUserId = string; // 냉장고_사용자_관계 ID
export type InviterId = string; // 초대한 사용자 ID
export type InviteeId = string; // 초대받은 사용자 ID

// User types
// ============================================================================

export interface User {
  id: UserId; // BIGINT
  provider: 'KAKAO' | 'NAVER'; // ENUM('KAKAO', 'NAVER')
  providerId: string; // VARCHAR(30) - 사용자 고유 소셜 ID
  name: string; // VARCHAR(20) - 사용자 이름
  fcmToken: string; // VARCHAR(255) - FCM 토큰
  createdAt: string; // TIMESTAMP - 생성 시간
  updatedAt: string; // TIMESTAMP - 변경 시간
}

// 사용자 생성 요청 타입
export interface CreateUserRequest {
  provider: 'KAKAO' | 'NAVER';
  providerId: string;
  name: string;
  fcmToken?: string;
}

// 사용자 업데이트 요청 타입
export interface UpdateUserRequest {
  name?: string;
  fcmToken?: string;
}

// Refrigerator types
// ============================================================================

export interface Refrigerator {
  id: RefrigeratorId; // BIGINT
  name: string; // VARCHAR(150) - 냉장고 이름
  createdAt: string; // TIMESTAMP - 생성 시간
  updatedAt: string; // TIMESTAMP - 변경 시간
}

// 냉장고 생성 요청 타입
export interface CreateRefrigeratorRequest {
  name: string;
}

// 냉장고 업데이트 요청 타입
export interface UpdateRefrigeratorRequest {
  name?: string;
}

// Refrigerator User types
// ============================================================================

export interface RefrigeratorUser {
  id: RefrigeratorUserId; // BIGINT - 냉장고_사용자_관계 ID
  refrigeratorId: RefrigeratorId; // BIGINT - 냉장고 ID
  inviterId: InviterId; // BIGINT - 초대한 사용자 ID
  inviteeId: InviteeId; // BIGINT - 초대받은 사용자 ID
  createdAt: string; // TIMESTAMP - 생성 시간
  updatedAt: string; // TIMESTAMP - 변경 시간
}

// 냉장고에 사용자 추가 요청 타입
export interface AddUserToRefrigeratorRequest {
  inviteeId: InviteeId; // 초대받을 사용자 ID
}

// Grocery types
// ============================================================================

export interface GroceryList {
  id: GroceryListId; // BIGINT - 장바구니 ID
  refrigeratorId: RefrigeratorId; // BIGINT - 냉장고 ID
  totalAmount: number; // INT - 총 금액
  createdAt: string; // TIMESTAMP - 생성 시간
  updatedAt: string; // TIMESTAMP - 변경 시간
}

// 장바구니 생성 요청 타입
export interface CreateGroceryListRequest {
  refrigeratorId: RefrigeratorId;
  totalAmount?: number;
}

// 장바구니 업데이트 요청 타입
export interface UpdateGroceryListRequest {
  totalAmount?: number;
}

// Invite types
// ============================================================================

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

export interface RefrigeratorInvitation {
  id: string; // BIGINT - 냉장고 초대 ID
  refrigeratorId: RefrigeratorId; // BIGINT - 냉장고 ID
  inviterId: InviterId; // BIGINT - 초대한 사용자 ID
  inviteeId: InviteeId; // BIGINT - 초대받은 사용자 ID
  status: InvitationStatus; // ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED')
  createdAt: string; // TIMESTAMP - 생성 시간
  updatedAt: string; // TIMESTAMP - 변경 시간
}

// 냉장고 초대 생성 요청 타입
export interface CreateInvitationRequest {
  refrigeratorId: RefrigeratorId;
  inviteeId: InviteeId;
}

// 냉장고 초대 상태 업데이트 요청 타입
export interface UpdateInvitationRequest {
  status: InvitationStatus;
}

// History types
// ============================================================================

export interface UsageHistory {
  id: HistoryId; // BIGINT - 사용 내역 ID
  userId: UserId; // BIGINT - 사용자 ID
  refrigeratorIngredientId: string; // BIGINT - 냉장고 식재료 ID
  usedQuantity: number; // INT - 사용 갯수
  usedAt: string; // TIMESTAMP - 사용 시간
}

// 사용 내역 생성 요청 타입
export interface CreateUsageHistoryRequest {
  refrigeratorIngredientId: number;
  usedQuantity: number;
}

// Date and Time types
// ============================================================================

export type DateString = string; // ISO 8601 형식: "2025-08-16T10:30:00Z"
export type TimeString = string; // HH:mm 형식: "14:30"
export type TimestampString = string; // Unix timestamp -> 문자열

export interface DateRange {
  startDate: DateString;
  endDate: DateString;
}

export interface TimeRange {
  startTime: TimeString;
  endTime: TimeString;
}

// State types
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Form types
// ============================================================================

export interface FormField {
  value: string;
  error: string | null;
  touched: boolean;
}

export type FormState<T extends Record<string, any>> = {
  [K in keyof T]: FormField;
};

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule;
};

// File types
// ============================================================================

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt: DateString;
}

export type FileUploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface FileUploadState {
  file: FileInfo;
  status: FileUploadStatus;
  progress: number;
  error?: string;
}

// Locate types
// ============================================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Location {
  coordinates: Coordinates;
  address?: Address;
}

// Device types
// ============================================================================

export type Platform = 'ios' | 'android';

export interface DeviceInfo {
  platform: Platform;
  version: string;
  model?: string;
  brand?: string;
  uniqueId: string;
}

// Notify types
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: DateString;
  readAt?: DateString;
  actionUrl?: string;
}

export interface PushNotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
}

// Event types
// ============================================================================

export interface BaseEvent {
  id: string;
  type: string;
  timestamp: DateString;
  userId?: UserId;
}

export interface ErrorEvent extends BaseEvent {
  type: 'error';
  error: {
    message: string;
    stack?: string;
    code?: string;
  };
}

export interface UserEvent extends BaseEvent {
  type: 'user_action';
  action: string;
  data?: Record<string, any>;
}

export type AppEvent = ErrorEvent | UserEvent;

// Settings types
// ============================================================================

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReporting: boolean;
  };
}

// Search types
// ============================================================================

export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Color types
// ============================================================================

export type ColorValue = string; // hex, rgb, rgba ...
export type ColorTheme =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export interface ColorPalette {
  primary: ColorValue;
  secondary: ColorValue;
  background: ColorValue;
  surface: ColorValue;
  text: ColorValue;
  textSecondary: ColorValue;
  border: ColorValue;
  error: ColorValue;
  warning: ColorValue;
  success: ColorValue;
  info: ColorValue;
}

// network types
// ============================================================================

export type NetworkStatus = 'online' | 'offline';
export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'none';

export interface NetworkInfo {
  status: NetworkStatus;
  type: ConnectionType;
  isConnected: boolean;
  isInternetReachable: boolean;
}

// Perfomance Mertics types
// ============================================================================

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  strategy: 'lru' | 'fifo' | 'lifo';
}

// DB Utils types
// ============================================================================

export interface RawDatabaseResponse {
  [key: string]: string | number | null | undefined;
}

// TIMESTAMP -> Date
export type WithParsedDates<T> = {
  [K in keyof T]: T[K] extends string
    ? K extends 'createdAt' | 'updatedAt' | 'usedAt'
      ? Date
      : T[K]
    : T[K];
};

// DB pagination
export interface DatabasePaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// DB transaction
export interface TransactionOptions {
  timeout?: number;
  isolationLevel?:
    | 'READ_UNCOMMITTED'
    | 'READ_COMMITTED'
    | 'REPEATABLE_READ'
    | 'SERIALIZABLE';
}
