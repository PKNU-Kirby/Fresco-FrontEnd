import { AsyncStorageService } from '../services/AsyncStorageService';
import { User } from '../types/auth';
import { FridgeWithRole } from '../types/permission';
import { FridgeApiResponse } from '../services/fridgeControllerAPI';

export interface FridgeValidationResult {
  isValid: boolean;
  errors: string[];
}

export class FridgeUtils {
  /**
   * 냉장고 이름 유효성 검사
   */
  static validateFridgeName(name: string): FridgeValidationResult {
    const errors: string[] = [];

    if (!name || !name.trim()) {
      errors.push('냉장고 이름은 필수입니다.');
    } else if (name.trim().length < 2) {
      errors.push('냉장고 이름은 최소 2자 이상이어야 합니다.');
    } else if (name.trim().length > 50) {
      errors.push('냉장고 이름은 50자를 초과할 수 없습니다.');
    }

    // 특수문자 체크 (기본적인 것만)
    const invalidChars = /[<>:"\/\\|?*]/g;
    if (invalidChars.test(name)) {
      errors.push(
        '냉장고 이름에는 < > : " / \\ | ? * 문자를 사용할 수 없습니다.',
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 로컬 냉장고 생성 동기화
   */
  static async syncCreateToLocal(
    serverResponse: FridgeApiResponse,
    currentUser: User,
    requestedName: string,
  ): Promise<boolean> {
    try {
      if (!serverResponse.result) {
        console.warn('서버 응답에 result가 없어서 로컬 동기화 스킵');
        return false;
      }

      const serverFridge = serverResponse.result;

      // AsyncStorageService에 createRefrigerator 메서드가 있는지 확인
      if (AsyncStorageService.createRefrigerator) {
        await AsyncStorageService.createRefrigerator(
          serverFridge.name || requestedName,
          parseInt(currentUser.id, 10),
          serverFridge.id,
        );
        console.log('냉장고 로컬 생성 동기화 완료');
        return true;
      } else {
        console.warn('AsyncStorageService.createRefrigerator 메서드가 없음');
        return false;
      }
    } catch (error) {
      console.error('냉장고 로컬 생성 동기화 실패:', error);
      return false;
    }
  }

  /**
   * 로컬 냉장고 수정 동기화
   */
  static async syncUpdateToLocal(
    fridgeId: string,
    updateData: { name: string },
  ): Promise<boolean> {
    try {
      if (AsyncStorageService.updateRefrigerator) {
        await AsyncStorageService.updateRefrigerator(
          parseInt(fridgeId, 10),
          updateData,
        );
        console.log('냉장고 로컬 수정 동기화 완료');
        return true;
      } else {
        console.warn('AsyncStorageService.updateRefrigerator 메서드가 없음');
        return false;
      }
    } catch (error) {
      console.error('냉장고 로컬 수정 동기화 실패:', error);
      return false;
    }
  }

  /**
   * 로컬 냉장고 삭제 동기화
   */
  static async syncDeleteToLocal(
    fridgeId: string,
    currentUserId: string,
  ): Promise<boolean> {
    try {
      // 1차: AsyncStorageService.deleteRefrigerator 시도
      if (AsyncStorageService.deleteRefrigerator) {
        await AsyncStorageService.deleteRefrigerator(parseInt(fridgeId, 10));
        console.log('냉장고 로컬 삭제 동기화 완료 (deleteRefrigerator)');
        return true;
      }

      // 2차: removeUserFromRefrigerator 시도
      if (AsyncStorageService.removeUserFromRefrigerator) {
        await AsyncStorageService.removeUserFromRefrigerator(
          parseInt(fridgeId, 10),
          parseInt(currentUserId, 10),
        );
        console.log(
          '냉장고 로컬 삭제 동기화 완료 (removeUserFromRefrigerator)',
        );
        return true;
      }

      // 3차: 직접 AsyncStorage 조작
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      const userKey = `user_${currentUserId}_refrigerators`;
      const userFridges = await AsyncStorage.getItem(userKey);

      if (userFridges) {
        const fridgeList = JSON.parse(userFridges);
        const updatedFridges = fridgeList.filter(
          (fridge: any) => fridge.id !== fridgeId,
        );
        await AsyncStorage.setItem(userKey, JSON.stringify(updatedFridges));
        console.log('냉장고 로컬 삭제 동기화 완료 (직접 조작)');
        return true;
      }

      return false;
    } catch (error) {
      console.error('냉장고 로컬 삭제 동기화 실패:', error);
      return false;
    }
  }

  /**
   * 에러 메시지 생성
   */
  static getErrorMessage(
    error: any,
    operation: 'create' | 'update' | 'delete',
  ): string {
    const operationTexts = {
      create: '생성',
      update: '수정',
      delete: '삭제',
    };

    const operationText = operationTexts[operation];

    if (error.status) {
      switch (error.status) {
        case 400:
          return `잘못된 요청입니다. 냉장고 정보를 확인해주세요.`;
        case 401:
          return '인증이 필요합니다. 다시 로그인해주세요.';
        case 403:
          return `이 냉장고를 ${operationText}할 권한이 없습니다.`;
        case 404:
          return operation === 'delete'
            ? '냉장고가 이미 삭제되었습니다.'
            : '냉장고를 찾을 수 없습니다.';
        case 409:
          return '이미 존재하는 냉장고 이름입니다.';
        case 500:
          return `서버 오류로 냉장고 ${operationText}에 실패했습니다. 잠시 후 다시 시도해주세요.`;
        default:
          return `냉장고 ${operationText}에 실패했습니다. (${error.status})`;
      }
    }

    if (error.message) {
      return error.message;
    }

    return `냉장고 ${operationText}에 실패했습니다.`;
  }

  /**
   * 성공 메시지 생성
   */
  static getSuccessMessage(
    operation: 'create' | 'update' | 'delete',
    fridgeName?: string,
  ): string {
    const name = fridgeName ? `"${fridgeName}"` : '냉장고';

    switch (operation) {
      case 'create':
        return `새 냉장고 ${name}가 생성되었습니다.`;
      case 'update':
        return `냉장고 ${name} 정보가 업데이트되었습니다.`;
      case 'delete':
        return `냉장고 ${name}가 성공적으로 삭제되었습니다.`;
      default:
        return '작업이 완료되었습니다.';
    }
  }

  /**
   * 냉장고 권한 체크
   */
  static checkPermission(
    fridge: FridgeWithRole,
    action: 'edit' | 'delete',
  ): boolean {
    switch (action) {
      case 'edit':
        return fridge.isOwner || fridge.canEdit === true;
      case 'delete':
        return fridge.isOwner || fridge.canDelete === true;
      default:
        return false;
    }
  }

  /**
   * 권한 없음 메시지 생성
   */
  static getPermissionDeniedMessage(action: 'edit' | 'delete'): string {
    switch (action) {
      case 'edit':
        return '이 냉장고를 편집할 권한이 없습니다.';
      case 'delete':
        return '이 냉장고를 삭제할 권한이 없습니다. (소유자만 가능)';
      default:
        return '이 작업을 수행할 권한이 없습니다.';
    }
  }

  /**
   * 냉장고 데이터 정규화
   */
  static normalizeFridgeData(fridgeData: any): {
    name: string;
    description?: string;
  } {
    return {
      name: fridgeData.name?.trim() || '',
      description: fridgeData.description?.trim() || undefined,
    };
  }

  /**
   * 디버깅용 로그 출력
   */
  static debugLog(operation: string, data: any): void {
    if (__DEV__) {
      console.log(`[FridgeUtils] ${operation}:`, data);
    }
  }
}
