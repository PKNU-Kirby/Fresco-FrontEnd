import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { ApiService } from '../services/apiServices';
import { AsyncStorageService } from '../services/AsyncStorageService';
import { PermissionAPIService } from '../services/API/permissionAPI';
import { isOwner } from '../types';

export type Member = {
  id: number;
  name: string;
  role: 'owner' | 'member';
  joinDate: string;
  email?: string;
  avatar?: string;
};

export type CurrentUser = {
  id: number;
  name: string;
  role: 'owner' | 'member';
  isOwner: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
};

export const useApiMembers = (fridgeId: number, _fridgeName: string) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // 멤버 목록 로드 (기존 useFridgeSettings와 동일한 방식)
  const loadMembers = async () => {
    try {
      setIsLoading(true);
      console.log('=== 냉장고 멤버 목록 로드 ===');
      console.log('냉장고 ID:', fridgeId);

      const [fridgeMembers, fridgePermissions] = await Promise.all([
        ApiService.getFridgeMembers(fridgeId),
        PermissionAPIService.getFridgePermissions(fridgeId), // 이걸로 변경!
      ]);

      console.log('=== 디버깅 정보 ===');
      console.log('membersResponse:', fridgeMembers);
      console.log('permissionsResponse:', fridgePermissions);

      // 현재 사용자 정보 가져오기 (토큰에서 추출된 정보 사용)
      const userId = await AsyncStorageService.getCurrentUserId();
      console.log('현재 사용자 ID:', userId);

      if (!userId) {
        Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
        return;
      }

      console.log('🔍 fridgePermissions:', fridgePermissions);

      // 권한 기반으로 역할 결정
      const isOwner = fridgePermissions.canEdit && fridgePermissions.canDelete;
      const userRole = isOwner ? 'owner' : 'member';

      console.log('🔍 결정된 userRole:', userRole);
      console.log('🔍 canEdit:', fridgePermissions.canEdit);
      console.log('🔍 canDelete:', fridgePermissions.canDelete);

      // currentUser 설정 - 권한 정보 포함
      const user = {
        id: userId.toString(),
        name: 'Current User',
        role: userRole,
        isOwner: isOwner,
        canEdit: fridgePermissions.canEdit,
        canDelete: fridgePermissions.canDelete,
      };

      console.log('최종 설정된 currentUser:', user);
      setCurrentUser(user);

      // 각 멤버의 역할 결정 (간단하게)
      const memberList: Member[] = fridgeMembers.map((member: any) => {
        // 현재 사용자면 owner, 아니면 member로 설정
        const isSelf = member.userId.toString() === userId.toString();
        const memberRole = isSelf ? userRole : 'member';

        console.log(
          `멤버 ${member.userName}(${member.userId}): isSelf=${isSelf}, role=${memberRole}`,
        );

        return {
          id: member.userId.toString(),
          name: member.userName || `사용자 ${member.userId}`,
          role: memberRole,
          joinDate: new Date().toISOString().split('T')[0],
          email: member.email,
        };
      });

      console.log('완성된 멤버 데이터:', memberList);
      setMembers(memberList);
    } catch (error) {
      console.error('멤버 목록 로드 실패:', error);
      Alert.alert('오류', '멤버 목록을 불러올 수 없습니다.');
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 멤버 클릭 핸들러 (기존 Alert 방식 유지)
  const handleMemberPress = (member: Member) => {
    const roleText = member.role === 'owner' ? '방장' : '구성원';
    const joinDateText = new Date(member.joinDate).toLocaleDateString('ko-KR');

    Alert.alert(
      member.name,
      `역할: ${roleText}\n가입일: ${joinDateText}${
        member.email ? `\n이메일: ${member.email}` : ''
      }`,
      [{ text: '확인', style: 'default' }],
    );
  };

  // 멤버 삭제 기능 (새로운 deleteFridgeMember API 사용)
  const removeMember = async (memberId: number) => {
    try {
      setIsLoading(true);

      // ApiService의 deleteFridgeMember 메서드 사용
      await ApiService.deleteFridgeMember(fridgeId, memberId);

      // 성공 시 로컬 state에서 해당 멤버 제거
      setMembers(prevMembers =>
        prevMembers.filter(member => member.id !== memberId),
      );

      return { success: true };
    } catch (error) {
      console.error('멤버 삭제 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 현재 사용자 권한 확인 함수 (권한 API 결과를 직접 사용)
  const canRemoveMember = (targetMember: Member) => {
    console.log('=== 삭제 권한 확인 ===');
    console.log('currentUser:', currentUser);
    console.log('targetMember:', targetMember);

    if (!currentUser) {
      console.log('currentUser 없음');
      return false;
    }

    // 현재 사용자가 방장이어야 함 (currentUser.role 사용)
    console.log('currentUser.role:', currentUser.role);

    if (currentUser.role !== 'owner') {
      console.log('현재 사용자가 방장이 아님');
      return false;
    }

    // 자기 자신은 삭제할 수 없음
    if (targetMember.id === currentUser.id) {
      console.log('자기 자신은 삭제 불가');
      return false;
    }

    // 다른 방장은 삭제할 수 없음
    if (targetMember.role === 'owner') {
      console.log('다른 방장은 삭제 불가');
      return false;
    }

    console.log('삭제 권한 있음');
    return true;
  };

  useEffect(() => {
    loadMembers();
  }, [fridgeId]);

  useFocusEffect(
    React.useCallback(() => {
      loadMembers();
    }, [fridgeId]),
  );

  return {
    members,
    isLoading,
    currentUser,
    loadMembers,
    handleMemberPress,
    removeMember,
    canRemoveMember,
  };
};
