import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { AsyncStorageService } from '../services/AsyncStorageService';

export type Member = {
  id: string;
  name: string;
  role: 'owner' | 'member';
  joinDate: string;
};

export const useMembers = (fridgeId: string, _fridgeName: string) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 멤버 목록 로드
  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorageService.getCurrentUserId();
      if (!userId) return;

      const user = await AsyncStorageService.getUserById(userId);
      setCurrentUser(user);

      const refrigeratorUsers =
        await AsyncStorageService.getRefrigeratorUsers();
      const users = await AsyncStorageService.getUsers();
      const refrigerators = await AsyncStorageService.getRefrigerators();

      const currentFridge = refrigerators.find(
        r => r.id.toString() === fridgeId.toString(),
      );

      if (!currentFridge) {
        console.error('냉장고를 찾을 수 없습니다:', fridgeId);
        return;
      }

      const fridgeMembers = refrigeratorUsers.filter(
        ru => ru.refrigeratorId.toString() === fridgeId.toString(),
      );

      const memberList: Member[] = fridgeMembers
        .map(ru => {
          const memberUser = users.find(u => u.id === ru.inviteeId.toString());
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
      Alert.alert('오류', '멤버 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberPress = (member: Member) => {
    Alert.alert(
      member.name,
      `역할: ${member.role === 'owner' ? '방장' : '구성원'}\n가입일: ${
        member.joinDate
      }`,
      [{ text: '확인', style: 'default' }],
    );
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
  };
};
