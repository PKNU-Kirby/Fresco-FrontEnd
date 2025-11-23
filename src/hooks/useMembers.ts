import { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { AsyncStorageService } from '../services/AsyncStorageService';

export type Member = {
  id: number;
  name: string;
  role: 'owner' | 'member';
  joinDate: string;
};

// ConfirmModal 상태 타입
export interface MembersModalState {
  errorModalVisible: boolean;
  memberInfoModalVisible: boolean;
  memberInfoTitle: string;
  memberInfoMessage: string;
  setErrorModalVisible: (visible: boolean) => void;
  setMemberInfoModalVisible: (visible: boolean) => void;
}

export const useMembers = (fridgeId: number, _fridgeName: string) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // ConfirmModal 상태들
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [memberInfoModalVisible, setMemberInfoModalVisible] = useState(false);
  const [memberInfoTitle, setMemberInfoTitle] = useState('');
  const [memberInfoMessage, setMemberInfoMessage] = useState('');

  // 멤버 목록 로드
  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorageService.getCurrentUserId();
      if (!userId) return;

      const user = await AsyncStorageService.getUserById(Number(userId));
      setCurrentUser(user);

      const refrigeratorUsers =
        await AsyncStorageService.getRefrigeratorUsers();
      const users = await AsyncStorageService.getUsers();
      const refrigerators = await AsyncStorageService.getRefrigerators();

      const currentFridge = refrigerators.find(r => r.id === fridgeId);

      if (!currentFridge) {
        console.error('냉장고를 찾을 수 없습니다:', fridgeId);
        return;
      }

      const fridgeMembers = refrigeratorUsers.filter(
        ru => ru.refrigeratorId === fridgeId,
      );

      const memberList: Member[] = fridgeMembers
        .map(ru => {
          const memberUser = users.find(u => u.id === ru.inviteeId);
          if (!memberUser) return null;

          const isOwner = ru.inviterId === ru.inviteeId;

          return {
            id: memberUser.id,
            name: memberUser.name,
            role: isOwner ? ('owner' as const) : ('member' as const),
            joinDate: new Date(ru.createdAt)
              .toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
              .replace(/\//g, '.'),
          };
        })
        .filter((member): member is Member => member !== null)
        .sort((a, b) => {
          if (a.role === 'owner' && b.role === 'member') return -1;
          if (a.role === 'member' && b.role === 'owner') return 1;
          return (
            new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime()
          );
        });

      setMembers(memberList);
    } catch (error) {
      console.error('멤버 목록 로드 실패:', error);
      setErrorModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberPress = (member: Member) => {
    setMemberInfoTitle(member.name);
    setMemberInfoMessage(
      `역할: ${member.role === 'owner' ? '방장' : '구성원'}\n가입일: ${
        member.joinDate
      }`,
    );
    setMemberInfoModalVisible(true);
  };

  useEffect(() => {
    loadMembers();
  }, [fridgeId]);

  useFocusEffect(
    React.useCallback(() => {
      loadMembers();
    }, [fridgeId]),
  );

  const modalState: MembersModalState = {
    errorModalVisible,
    memberInfoModalVisible,
    memberInfoTitle,
    memberInfoMessage,
    setErrorModalVisible,
    setMemberInfoModalVisible,
  };

  return {
    members,
    isLoading,
    currentUser,
    loadMembers,
    handleMemberPress,
    modalState, // 모달 상태 추가
  };
};
