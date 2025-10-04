static async getUserPermissions(): Promise<FridgePermission[]> {
    try {
      const token = await getValidAccessToken();
      if (!token) {
        throw {
          status: 401,
          code: 'TOKEN_EXPIRED',
          message: '인증 토큰이 없습니다',
        };
      }

      // console.log('권한 API 호출 시작...');

      const response = await fetch(
        `${Config.API_BASE_URL}/api/v1/refrigerator/permissions`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      // console.log('권한 API 응답 상태:', response.status);

      if (!response.ok) {
        throw {
          status: response.status,
          message: response.statusText,
          response: response,
        };
      }

      const data: PermissionResponse = await response.json();
      // console.log('권한 API 원본 응답:', JSON.stringify(data, null, 2));

      // 성공 코드 확인 (실제 API 스펙에 맞게 수정 필요)
      if (!data.code || !data.code.includes('OK')) {
        throw {
          status: 200,
          code: 'API_ERROR',
          message: data.message || 'API 응답 오류',
        };
      }

      return PermissionUtils.parsePermissionResponse(data);
    } catch (error) {
      console.error('권한 조회 실패:', error);
      ApiErrorHandler.logError(error, 'PermissionAPI.getUserPermissions');

      // 권한 조회 실패 시 빈 배열 반환 (앱이 계속 동작하도록)
      console.warn('권한 조회 실패로 빈 권한 목록 반환');
      return [];
    }
  }
