import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import ApiService from '../services/apiServices';
import { AsyncStorageService } from '../services/AsyncStorageService';

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

  // 멤버 목록 로드 (API 연결)
  // useApiMembers.ts에서
  const loadMembers = async () => {
    try {
      setIsLoading(true);

      // AsyncStorageService 안전성 검사 추가
      if (
        !AsyncStorageService ||
        typeof AsyncStorageService.getCurrentUser !== 'function'
      ) {
        console.warn('AsyncStorageService를 사용할 수 없습니다');
        Alert.alert('오류', '사용자 서비스를 사용할 수 없습니다.');
        return;
      }

      const currentUser = await AsyncStorageService.getCurrentUser();
      // 나머지 로직...
    } catch (error) {
      console.error('멤버 목록 로드 실패:', error);
      Alert.alert('오류', '멤버 목록을 불러올 수 없습니다.');
      setMembers([]); // 실패 시 빈 배열로 설정
    } finally {
      setIsLoading(false);
    }
  };

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
