export interface Member {
  id: string;
  name: string;
  role: 'owner' | 'member';
  joinDate?: string;
}

export interface ApiFridgeMember {
  userId: string;
  userName: string;
  role: 'OWNER' | 'MEMBER';
}

export const transformApiMemberToMember = (
  apiMember: ApiFridgeMember,
): Member => {
  return {
    id: apiMember.userId,
    name: apiMember.userName,
    role: apiMember.role.toLowerCase() as 'owner' | 'member',
    joinDate: new Date().toISOString(), // 실제로는 API에서 받아와야 함
  };
};
