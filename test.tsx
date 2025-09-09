export const getAccessToken = async (): Promise<string | null> => {
  try {
    // AsyncStorage에서 직접 조회 (가장 확실한 방법)
    const token = await AsyncStorage.getItem('accessToken');
    console.log(
      '액세스 토큰 조회:',
      token ? `${token.substring(0, 20)}...` : 'null',
    );
    return token;
  } catch (error) {
    console.error('액세스 토큰 조회 실패:', error);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    // AsyncStorage에서 직접 조회 (가장 확실한 방법)
    const token = await AsyncStorage.getItem('refreshToken');
    console.log(
      '리프레시 토큰 조회:',
      token ? `${token.substring(0, 20)}...` : 'null',
    );
    return token;
  } catch (error) {
    console.error('리프레시 토큰 조회 실패:', error);
    return null;
  }
};

export const saveTokens = async (
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  try {
    console.log('토큰 저장 시작:', {
      accessToken: accessToken.substring(0, 20) + '...',
      refreshToken: refreshToken.substring(0, 20) + '...',
    });

    // 두 방식 모두 사용해서 확실하게 저장
    await Promise.all([
      AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
      ]),
      AsyncStorageService.setAuthToken(accessToken),
      AsyncStorageService.setRefreshToken(refreshToken),
    ]);

    console.log('토큰 저장 완료');
  } catch (error) {
    console.error('토큰 저장 실패:', error);
    throw error;
  }
};

// =================================================================
// 토큰 상태 디버깅 함수 추가
// =================================================================

export const debugTokenState = async () => {
  console.log('=== 토큰 상태 디버그 ===');

  try {
    // 모든 방식으로 토큰 조회해서 비교
    const [
      directAccess,
      directRefresh,
      serviceAccess,
      serviceRefresh,
      utilsAccess,
      utilsRefresh,
    ] = await Promise.all([
      AsyncStorage.getItem('accessToken'),
      AsyncStorage.getItem('refreshToken'),
      AsyncStorageService.getAuthToken(),
      AsyncStorageService.getRefreshToken(),
      getAccessToken(),
      getRefreshToken(),
    ]);

    console.log('Direct AsyncStorage:', {
      access: directAccess ? `${directAccess.substring(0, 20)}...` : 'null',
      refresh: directRefresh ? `${directRefresh.substring(0, 20)}...` : 'null',
    });

    console.log('AsyncStorageService:', {
      access: serviceAccess ? `${serviceAccess.substring(0, 20)}...` : 'null',
      refresh: serviceRefresh
        ? `${serviceRefresh.substring(0, 20)}...`
        : 'null',
    });

    console.log('AuthUtils:', {
      access: utilsAccess ? `${utilsAccess.substring(0, 20)}...` : 'null',
      refresh: utilsRefresh ? `${utilsRefresh.substring(0, 20)}...` : 'null',
    });

    // 일관성 검사
    const allAccessSame =
      directAccess === serviceAccess && serviceAccess === utilsAccess;
    const allRefreshSame =
      directRefresh === serviceRefresh && serviceRefresh === utilsRefresh;

    console.log('토큰 일관성:', {
      accessTokenConsistent: allAccessSame,
      refreshTokenConsistent: allRefreshSame,
    });
  } catch (error) {
    console.error('토큰 상태 디버그 실패:', error);
  }

  console.log('=====================');
};

// 사용법: 로그인 후에 debugTokenState() 호출해서 토큰이 제대로 저장되었는지 확인
