import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { ApiService } from '../services/apiServices';
import { AsyncStorageService } from '../services/AsyncStorageService';
import { PermissionAPIService } from '../services/API/permissionAPI';

export type Member = {
  id: string;
  name: string;
  role: 'owner' | 'member';
  joinDate: string;
  email?: string;
  avatar?: string;
};

export const useApiMembers = (fridgeId: string, _fridgeName: string) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 멤버 목록 로드 (기존 useFridgeSettings와 동일한 방식)
  const loadMembers = async () => {
    try {
      setIsLoading(true);
      console.log('=== 냉장고 멤버 목록 로드 ===');
      console.log('냉장고 ID:', fridgeId);

      // 기존 useFridgeSettings와 동일한 방식으로 데이터 가져오기
      const [fridgeMembers, userPermissions] = await Promise.all([
        ApiService.getFridgeMembers(fridgeId),
        PermissionAPIService.getUserPermissions(),
      ]);

      console.log('=== 디버깅 정보 ===');
      console.log('membersResponse:', fridgeMembers);
      console.log('permissionsResponse:', userPermissions);

      // 현재 냉장고에 대한 권한 정보 찾기
      const currentFridgePermission = userPermissions.find(
        (perm: any) => perm.fridgeId === fridgeId.toString(),
      );

      console.log('현재 냉장고 권한 정보:', currentFridgePermission);

      // 현재 사용자 정보 가져오기 (토큰에서 추출된 정보 사용)
      const userId = await AsyncStorageService.getCurrentUserId();
      console.log('현재 사용자 ID:', userId);

      if (!userId) {
        Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
        return;
      }

      // 중요: 권한 정보 확인
      console.log('currentFridgePermission:', currentFridgePermission);
      console.log(
        'currentFridgePermission?.role:',
        currentFridgePermission?.role,
      );

      // currentUser 설정 - role 포함!!
      const userRole =
        currentFridgePermission?.role === 'OWNER' ? 'owner' : 'member';
      console.log('결정된 userRole:', userRole);

      const user = {
        id: userId.toString(),
        name: 'Current User',
        role: userRole, // 이 부분이 중요!
      };

      console.log('최종 설정된 currentUser:', user);
      setCurrentUser(user);

      // 각 멤버의 권한 확인하여 역할 결정
      const memberList: Member[] = fridgeMembers.map((member: any) => {
        // 각 멤버의 권한 찾기 (현재는 모든 멤버가 OWNER로 나오고 있음)
        const memberPermission = userPermissions.find(
          (perm: any) => perm.fridgeId === fridgeId.toString(),
        );

        const role = memberPermission?.role === 'OWNER' ? 'owner' : 'member';

        console.log(
          `멤버 ${member.userName}(${member.userId}): 권한기반역할=${memberPermission?.role}`,
        );

        return {
          id: member.userId.toString(),
          name: member.userName || `사용자 ${member.userId}`,
          role: role,
          joinDate: new Date().toISOString().split('T')[0], // 임시 가입일
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
  const removeMember = async (memberId: string) => {
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
