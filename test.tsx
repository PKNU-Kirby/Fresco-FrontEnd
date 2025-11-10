const loadMembers = async () => {
  try {
    setIsLoading(true);
    console.log('=== 냉장고 멤버 목록 로드 ===');
    console.log('냉장고 ID:', fridgeId);

    // ✅ getFridgePermissions 사용 (특정 fridgeId 전달)
    const [fridgeMembers, fridgePermissions] = await Promise.all([
      ApiService.getFridgeMembers(fridgeId),
      PermissionAPIService.getFridgePermissions(fridgeId), // fridgeId 전달
    ]);

    console.log('=== 디버깅 정보 ===');
    console.log('membersResponse:', fridgeMembers);
    console.log('fridgePermissions:', fridgePermissions); // { canEdit: true/false, canDelete: true/false }

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
