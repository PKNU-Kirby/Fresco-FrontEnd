// types/database.ts
// ERD 기반 타입 정의 (프론트엔드용)

// 기본 타입
export type DatabaseId = number; // BIGINT
export type SmallId = number; // SMALLINT

// 냉장고 식재료 (refrigeratorIngredient) - ERD 기반
export interface RefrigeratorIngredient {
  id: DatabaseId; // 냉장고식재료 id (BIGINT)
  refrigeratorId: DatabaseId; // 냉장고 id (BIGINT)
  ingredientId: DatabaseId; // 식재료 id (BIGINT)
  categoryId: SmallId; // 카테고리 id (SMALLINT)
  name: string; // 식재료 이름 (VARCHAR(150))
  expirationDate: string; // 소비기한 (DATE)
  quantity: number; // 갯수 (INT)
  createdAt: string; // 생성 시간 (TIMESTAMP)
  updatedAt: string; // 변경 시간 (TIMESTAMP)
}

// 식재료 (ingredient) - ERD 기반
export interface Ingredient {
  id: SmallId; // 식재료 id (SMALLINT)
  categoryId: SmallId; // 카테고리 id (SMALLINT)
  name: string; // 식재료 이름 (VARCHAR(50))
  defaultUseByPeriod: number; // 기본소비기한 일자 (INT)
  createdAt: string; // 생성 시간 (TIMESTAMP)
  updatedAt: string; // 변경 시간 (TIMESTAMP)
}

// 폼 데이터 타입 (UI용)
export interface ItemFormData {
  id: string; // 임시 ID (UI용)
  refrigeratorId?: DatabaseId; // 냉장고 ID (BIGINT)
  ingredientId?: SmallId; // 기존 식재료 매칭시 사용 (BIGINT)
  categoryId?: SmallId; // 카테고리 ID (SMALLINT)
  name: string; // 식재료 이름 (VARCHAR(150))
  quantity: string; // UI에서는 문자열로 관리
  unit: string; // UI 표시용 (실제 DB에는 없음)
  expirationDate: string; // 소비기한 (DATE) - YYYY.MM.DD 형식
  storageType: string; // 보관방법 (UI 표시용)
  itemCategory: string; // 카테고리명 (UI 표시용)
  photo?: string; // 사진 URI
}

// 인식된 데이터 타입
export interface RecognizedData {
  photo: string;
  name: string;
  quantity: string;
  unit?: string;
  expirationDate?: string;
  storageType?: string;
  itemCategory?: string;
  confidence?: number; // AI 인식 신뢰도 (추후 사용)
}

// DB 형식 변환용 타입
export interface DbFormatData {
  id: null; // Auto increment
  refrigeratorId: DatabaseId; // 냉장고 ID
  ingredientId?: DatabaseId; // 기존 식재료 ID (선택사항)
  categoryId: SmallId; // 카테고리 ID
  name: string; // 식재료 이름
  expirationDate: string | null; // 소비기한
  quantity: number; // 갯수
  createdAt: string; // 생성 시간
  updatedAt: string; // 변경 시간
}
