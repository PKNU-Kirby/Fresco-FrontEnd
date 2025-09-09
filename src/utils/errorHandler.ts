// utils/errorHandler.ts - 완전한 에러 처리 시스템

export interface ApiError {
  status?: number;
  code?: string;
  message?: string;
  data?: any;
  response?: any;
}

export type ErrorAction = 'retry' | 'login' | 'refresh' | 'none';

export class ApiErrorHandler {
  /**
   * API 에러를 사용자 친화적 메시지로 변환
   */
  static getErrorMessage(error: ApiError | any): string {
    // HTTP 상태 코드 기반 에러 메시지
    if (error.status) {
      switch (error.status) {
        case 400:
          return (
            error.message || '잘못된 요청입니다. 입력 정보를 확인해주세요.'
          );
        case 401:
          return '인증이 필요합니다. 다시 로그인해주세요.';
        case 403:
          return '이 작업을 수행할 권한이 없습니다.';
        case 404:
          return '요청한 리소스를 찾을 수 없습니다.';
        case 409:
          return '이미 존재하는 데이터이거나 충돌이 발생했습니다.';
        case 422:
          return '입력 데이터가 올바르지 않습니다.';
        case 429:
          return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
        case 500:
          return '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        case 502:
          return '서버가 응답하지 않습니다. 네트워크 연결을 확인해주세요.';
        case 503:
          return '서비스가 일시적으로 사용할 수 없습니다.';
        case 504:
          return '서버 응답 시간이 초과되었습니다.';
        default:
          return `네트워크 오류가 발생했습니다 (${error.status})`;
      }
    }

    // 커스텀 에러 코드 기반 메시지
    if (error.code) {
      switch (error.code) {
        case 'NETWORK_ERROR':
          return '네트워크 연결을 확인해주세요.';
        case 'TIMEOUT_ERROR':
          return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
        case 'PARSE_ERROR':
          return '서버 응답을 처리할 수 없습니다.';
        case 'TOKEN_EXPIRED':
          return '인증이 만료되었습니다. 다시 로그인해주세요.';
        case 'PERMISSION_DENIED':
          return '이 작업을 수행할 권한이 없습니다.';
        case 'RESOURCE_NOT_FOUND':
          return '요청한 데이터를 찾을 수 없습니다.';
        default:
          return error.message || '알 수 없는 오류가 발생했습니다.';
      }
    }

    // 일반적인 에러 메시지
    if (error.message) {
      // 네트워크 관련 에러 감지
      if (error.message.toLowerCase().includes('network')) {
        return '네트워크 연결을 확인해주세요.';
      }
      if (error.message.toLowerCase().includes('timeout')) {
        return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
      }
      if (error.message.toLowerCase().includes('fetch')) {
        return '서버와의 연결에 문제가 있습니다.';
      }

      return error.message;
    }

    return '알 수 없는 오류가 발생했습니다.';
  }

  /**
   * 에러 타입에 따른 권장 액션 제안
   */
  static getErrorAction(error: ApiError | any): ErrorAction {
    if (error.status) {
      switch (error.status) {
        case 401:
          return 'login';
        case 500:
        case 502:
        case 503:
        case 504:
          return 'retry';
        case 429:
          return 'refresh';
        default:
          return 'none';
      }
    }

    if (error.code) {
      switch (error.code) {
        case 'TOKEN_EXPIRED':
          return 'login';
        case 'NETWORK_ERROR':
        case 'TIMEOUT_ERROR':
        case 'PARSE_ERROR':
          return 'retry';
        default:
          return 'none';
      }
    }

    // 네트워크 관련 에러는 재시도 권장
    if (
      error.message &&
      (error.message.toLowerCase().includes('network') ||
        error.message.toLowerCase().includes('timeout') ||
        error.message.toLowerCase().includes('fetch'))
    ) {
      return 'retry';
    }

    return 'none';
  }

  /**
   * 재시도 가능한 에러인지 확인
   */
  static isRetryableError(error: ApiError | any): boolean {
    // 5xx 서버 에러는 재시도 가능
    if (error.status >= 500) {
      return true;
    }

    // 429 (Too Many Requests)도 재시도 가능
    if (error.status === 429) {
      return true;
    }

    // 네트워크 관련 에러 코드
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'PARSE_ERROR',
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED',
    ];

    if (error.code && retryableCodes.includes(error.code)) {
      return true;
    }

    // 메시지 기반 판단
    if (error.message) {
      const retryableMessages = [
        'network',
        'timeout',
        'connection',
        'fetch',
        'abort',
      ];

      const lowerMessage = error.message.toLowerCase();
      return retryableMessages.some(msg => lowerMessage.includes(msg));
    }

    return false;
  }

  /**
   * 에러 심각도 레벨 반환
   */
  static getErrorSeverity(
    error: ApiError | any,
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (error.status) {
      if (error.status >= 500) return 'critical';
      if (error.status === 403 || error.status === 401) return 'high';
      if (error.status >= 400) return 'medium';
    }

    if (error.code === 'NETWORK_ERROR') return 'medium';
    if (error.code === 'TOKEN_EXPIRED') return 'high';

    return 'low';
  }

  /**
   * 에러 로깅 (디버깅용)
   */
  static logError(error: ApiError | any, context?: string) {
    const severity = this.getErrorSeverity(error);
    const message = this.getErrorMessage(error);
    const action = this.getErrorAction(error);

    const logData = {
      timestamp: new Date().toISOString(),
      context: context || 'Unknown',
      severity,
      status: error.status,
      code: error.code,
      message,
      recommendedAction: action,
      originalError: error,
    };

    console.group(`🚨 API Error [${severity.toUpperCase()}]`);
    console.error('Error Details:', logData);
    if (error.stack) {
      console.error('Stack Trace:', error.stack);
    }
    console.groupEnd();

    // 프로덕션에서는 에러 리포팅 서비스로 전송
    // 예: Sentry, Crashlytics 등
    if (__DEV__ === false && severity === 'critical') {
      // 에러 리포팅 서비스로 전송하는 로직
      // this.reportToCrashlytics(logData);
    }
  }

  /**
   * 사용자에게 보여줄 에러 알림 데이터 생성
   */
  static createUserErrorAlert(error: ApiError | any, _context?: string) {
    const message = this.getErrorMessage(error);
    const action = this.getErrorAction(error);
    const severity = this.getErrorSeverity(error);

    let title = '오류';
    if (severity === 'critical') title = '심각한 오류';
    if (severity === 'high') title = '인증 오류';
    if (severity === 'medium') title = '요청 오류';

    const buttons: Array<{ text: string; style?: any; onPress?: () => void }> =
      [];

    switch (action) {
      case 'retry':
        buttons.push(
          { text: '취소', style: 'cancel' },
          {
            text: '다시 시도',
            onPress: () => {
              /* 재시도 로직 */
            },
          },
        );
        break;
      case 'login':
        buttons.push(
          { text: '취소', style: 'cancel' },
          {
            text: '로그인',
            onPress: () => {
              /* 로그인 페이지로 이동 */
            },
          },
        );
        break;
      case 'refresh':
        buttons.push(
          { text: '취소', style: 'cancel' },
          {
            text: '새로고침',
            onPress: () => {
              /* 페이지 새로고침 */
            },
          },
        );
        break;
      default:
        buttons.push({ text: '확인' });
    }

    return {
      title,
      message,
      buttons,
      severity,
      action,
    };
  }
}

// 에러 타입별 헬퍼 함수들
export class ErrorHelpers {
  /**
   * 네트워크 에러 여부 확인
   */
  static isNetworkError(error: any): boolean {
    return (
      ApiErrorHandler.getErrorAction(error) === 'retry' ||
      error.message?.toLowerCase().includes('network') ||
      error.code === 'NETWORK_ERROR'
    );
  }

  /**
   * 인증 에러 여부 확인
   */
  static isAuthError(error: any): boolean {
    return (
      error.status === 401 ||
      error.status === 403 ||
      error.code === 'TOKEN_EXPIRED'
    );
  }

  /**
   * 서버 에러 여부 확인
   */
  static isServerError(error: any): boolean {
    return error.status >= 500;
  }

  /**
   * 클라이언트 에러 여부 확인
   */
  static isClientError(error: any): boolean {
    return error.status >= 400 && error.status < 500;
  }
}

// React Native Alert용 헬퍼
export class AlertHelper {
  /**
   * 에러 알림 표시
   */
  static showErrorAlert(error: any, context?: string, onRetry?: () => void) {
    const alertData = ApiErrorHandler.createUserErrorAlert(error, context);

    // Alert.alert를 동적으로 import (React Native 환경에서만)
    import('react-native')
      .then(({ Alert }) => {
        const buttons = alertData.buttons.map(button => ({
          ...button,
          onPress:
            button.text === '다시 시도' && onRetry ? onRetry : button.onPress,
        }));

        Alert.alert(alertData.title, alertData.message, buttons);
      })
      .catch(() => {
        // React Native가 아닌 환경에서는 console.error로 대체
        console.error(`${alertData.title}: ${alertData.message}`);
      });
  }

  /**
   * 성공 알림 표시
   */
  static showSuccessAlert(title: string, message: string, onOk?: () => void) {
    import('react-native')
      .then(({ Alert }) => {
        Alert.alert(title, message, [{ text: '확인', onPress: onOk }]);
      })
      .catch(() => {
        console.log(`${title}: ${message}`);
      });
  }

  /**
   * 확인 알림 표시
   */
  static showConfirmAlert(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
  ) {
    import('react-native')
      .then(({ Alert }) => {
        Alert.alert(title, message, [
          { text: '취소', style: 'cancel', onPress: onCancel },
          { text: '확인', onPress: onConfirm },
        ]);
      })
      .catch(() => {
        console.log(`${title}: ${message}`);
      });
  }
}

// 사용 예시
/*
try {
  const result = await apiCall();
} catch (error) {
  // 에러 로깅
  ApiErrorHandler.logError(error, 'FridgeAPI.deleteFridge');
  
  // 사용자에게 알림 표시
  AlertHelper.showErrorAlert(error, 'FridgeAPI.deleteFridge', () => {
    // 재시도 로직
    retryApiCall();
  });
}
*/
