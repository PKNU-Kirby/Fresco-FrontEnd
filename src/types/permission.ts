export type FridgeRole = 'OWNER' | 'PARTICIPANT';

export interface FridgeWithRole {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  role: 'owner' | 'member';
  memberCount: number;
  isHidden: boolean;
  // 추가된 권한 관련 속성
  canEdit: boolean;
  canDelete: boolean;
}

export interface FridgePermission {
  fridgeId: number;
  role: FridgeRole;
  canEdit: boolean;
  canDelete: boolean;
}

export interface PermissionResponse {
  code: string;
  message: string;
  result: Array<{
    fridgeId: number;
    role: FridgeRole;
    memberCount?: number;
  }>;
}
