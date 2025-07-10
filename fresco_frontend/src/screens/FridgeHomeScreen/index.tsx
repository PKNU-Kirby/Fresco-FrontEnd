import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import CustomText from '../../components/common/CustomText';
import {RootStackParamList} from '../../../App';
import {styles} from './styles';

type FridgeItem = {
  id: number;
  name: string;
  quantity: string;
  expiryDate: string;
  imageUri?: string;
  storageType: string;
  itemCategory: string;
  fridgeId: number;
};

type Props = {
  route: {
    params: {
      fridgeId: number;
      fridgeName: string;
    };
  };
};

const FridgeHomeScreen = ({route}: Props) => {
  const {fridgeId, fridgeName} = route.params;
  const [activeStorageType, setActiveStorageType] = useState('냉장실'); // 🔧 변경: 보관 분류 상태
  const [activeItemCategory, setActiveItemCategory] = useState('전체'); // 🔧 변경: 식재료 유형 상태
  const [isStorageModalVisible, setIsStorageModalVisible] = useState(false); // 보관 분류 모달
  const [isItemCategoryModalVisible, setIsItemCategoryModalVisible] =
    useState(false); // 식재료 유형 모달
  const [isStorageEditMode, setIsStorageEditMode] = useState(false); // 보관 분류 편집 모드
  const [isListEditMode, setIsListEditMode] = useState(false); // 목록 편집 모드
  const [isAddStorageModalVisible, setIsAddStorageModalVisible] =
    useState(false); // 보관 분류 추가 모달
  const [newStorageName, setNewStorageName] = useState('');

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 보관 분류 목록 : 사용자가 등록한 보관 장소 분류
  const [storageTypes, setStorageTypes] = useState<string[]>([
    '전체',
    '냉장실',
    '냉동실',
    '실온',
    '과자박스',
    '아이스크림박스',
    '기타',
  ]);

  // 식재료 카테고리 목록
  const [itemCategories] = useState([
    '전체',
    '베이커리',
    '채소 / 과일',
    '정육 / 계란',
    '가공식품',
    '수산 / 건어물',
    '쌀 / 잡곡',
    '우유 / 유제품',
    '건강식품',
    '장 / 양념 / 소스',
    '기타',
  ]);

  // Mock data : contain FridgeId
  const getMockDataByFridgeId = (fridgeId: number) => {
    const dataMap: {[key: number]: FridgeItem[]} = {
      1: [
        // 본가
        {
          id: 1,
          name: '식빵',
          quantity: '1',
          expiryDate: '2025.07.15',
          storageType: '실온',
          itemCategory: '베이커리',
          fridgeId: 1,
        },
        {
          id: 2,
          name: '양배추',
          quantity: '1',
          expiryDate: '2025.07.20',
          storageType: '냉장실',
          itemCategory: '채소 / 과일',
          fridgeId: 1,
        },
        {
          id: 3,
          name: '닭가슴살 500g',
          quantity: '1',
          expiryDate: '2025.07.18',
          storageType: '냉장실',
          itemCategory: '정육 / 계란',
          fridgeId: 1,
        },
        {
          id: 4,
          name: '우유 1000ml',
          quantity: '1',
          expiryDate: '2025.07.25',
          storageType: '냉장실',
          itemCategory: '우유 / 유제품',
          fridgeId: 1,
        },
        {
          id: 5,
          name: '냉동만두',
          quantity: '1',
          expiryDate: '2025.12.31',
          storageType: '냉동실',
          itemCategory: '가공식품',
          fridgeId: 1,
        },
        {
          id: 6,
          name: '고추장',
          quantity: '1',
          expiryDate: '2026.03.20',
          storageType: '실온',
          itemCategory: '장 / 양념 / 소스',
          fridgeId: 1,
        },
        {
          id: 7,
          name: '초코과자',
          quantity: '3',
          expiryDate: '2025.09.30',
          storageType: '과자박스',
          itemCategory: '기타',
          fridgeId: 1,
        },
      ],
      2: [
        // 자취방
        {
          id: 8,
          name: '계란',
          quantity: '10',
          expiryDate: '2025.08.15',
          storageType: '냉장실',
          itemCategory: '정육 / 계란',
          fridgeId: 2,
        },
        {
          id: 9,
          name: '김치',
          quantity: '1통',
          expiryDate: '2025.12.31',
          storageType: '냉장실',
          itemCategory: '채소 / 과일',
          fridgeId: 2,
        },
        {
          id: 10,
          name: '바나나',
          quantity: '5',
          expiryDate: '2025.07.20',
          storageType: '실온',
          itemCategory: '채소 / 과일',
          fridgeId: 2,
        },
        {
          id: 11,
          name: '참치캔',
          quantity: '3',
          expiryDate: '2026.01.30',
          storageType: '실온',
          itemCategory: '수산 / 건어물',
          fridgeId: 2,
        },
        {
          id: 12,
          name: '아이스크림',
          quantity: '2',
          expiryDate: '2025.12.31',
          storageType: '아이스크림박스',
          itemCategory: '우유 / 유제품',
          fridgeId: 2,
        },
        {
          id: 13,
          name: '현미 5kg',
          quantity: '1',
          expiryDate: '2025.12.31',
          storageType: '실온',
          itemCategory: '쌀 / 잡곡',
          fridgeId: 2,
        },
      ],
      3: [
        // 냉동고
        {
          id: 14,
          name: '냉동새우 300g',
          quantity: '1',
          expiryDate: '2025.11.20',
          storageType: '냉동실',
          itemCategory: '수산 / 건어물',
          fridgeId: 3,
        },
        {
          id: 15,
          name: '냉동삼겹살 1kg',
          quantity: '1',
          expiryDate: '2025.10.15',
          storageType: '냉동실',
          itemCategory: '정육 / 계란',
          fridgeId: 3,
        },
        {
          id: 16,
          name: '냉동블루베리 500g',
          quantity: '1',
          expiryDate: '2025.12.31',
          storageType: '냉동실',
          itemCategory: '채소 / 과일',
          fridgeId: 3,
        },
      ],
      4: [
        // 숨김냉장고
        {
          id: 17,
          name: '오래된치즈',
          quantity: '1',
          expiryDate: '2025.06.01',
          storageType: '냉장실',
          itemCategory: '우유 / 유제품',
          fridgeId: 4,
        },
        {
          id: 18,
          name: '홍삼 1박스',
          quantity: '1',
          expiryDate: '2026.05.20',
          storageType: '실온',
          itemCategory: '건강식품',
          fridgeId: 4,
        },
      ],
    };

    return dataMap[fridgeId] || [];
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleAccountPress = () => {
    // 구성원 관리 화면
  };

  // 보관 분류
  const handleStorageTypePress = () => {
    setIsStorageModalVisible(true);
  };

  // 식재료 유형
  const handleItemCategoryPress = () => {
    setIsItemCategoryModalVisible(true);
  };

  const handleAddItem = () => {
    // 식재료 추가 화면
  };

  // SELECT : 보관 분류
  const handleStorageTypeSelect = (storageType: string) => {
    setActiveStorageType(storageType);
    setIsStorageModalVisible(false);
  };

  // SELECT : 식재료 유형
  const handleItemCategorySelect = (category: string) => {
    setActiveItemCategory(category);
    setIsItemCategoryModalVisible(false);
  };
  // 보관 분류 편집 모드 토글
  const handleStorageEditToggle = () => {
    setIsStorageEditMode(!isStorageEditMode);
  };

  // 보관 분류 삭제
  const handleDeleteStorageType = (storageType: string) => {
    setStorageTypes((prev: string[]) =>
      prev.filter((item: string) => item !== storageType),
    );
    // 현재 선택된 분류가 삭제되면 첫 번째로 변경
    if (activeStorageType === storageType && storageTypes.length > 1) {
      setActiveStorageType(
        storageTypes.filter((item: string) => item !== storageType)[0],
      );
    }
  };

  // 보관 분류 추가
  const handleAddStorageType = () => {
    if (newStorageName.trim()) {
      setStorageTypes(prev => [...prev, newStorageName.trim()]);
      setNewStorageName('');
      setIsAddStorageModalVisible(false);
    }
  };

  // 보관 분류 추가 모달 열기
  const handleOpenAddStorageModal = () => {
    setIsAddStorageModalVisible(true);
  };

  // Mock data : 이중 필터링 (보관 분류 + 식재료 유형)
  const filteredItems = getMockDataByFridgeId(fridgeId)
    .filter(
      item =>
        activeStorageType === '전체' || item.storageType === activeStorageType,
    ) // 보관 분류 필터
    .filter(
      item =>
        activeItemCategory === '전체' ||
        item.itemCategory === activeItemCategory,
    ); // 식재료 유형 필터

  const renderItem = ({item}: {item: FridgeItem}) => (
    <View style={styles.itemCard}>
      <View style={styles.itemImageContainer}>
        <View style={styles.itemImagePlaceholder} />
      </View>
      <View style={styles.itemInfo}>
        <CustomText style={styles.itemName}>{item.name}</CustomText>
        <View style={styles.itemDetails}>
          <CustomText style={styles.itemQuantity}>
            {item.quantity} 개
          </CustomText>
          <CustomText style={styles.itemExpiry}>{item.expiryDate}</CustomText>
        </View>
        <CustomText style={styles.itemStatus}>
          {item.storageType} | {item.itemCategory}
        </CustomText>
      </View>
    </View>
  );

  const renderTabContent = () => {
    return (
      <View style={styles.content}>
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* 플러스 버튼 */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <View style={styles.addButtonIcon}>
            <View style={styles.addButtonHorizontal} />
            <View style={styles.addButtonVertical} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <CustomText style={styles.headerButtonText}>뒤로가기</CustomText>
        </TouchableOpacity>

        <CustomText style={styles.headerTitle}>{fridgeName}</CustomText>

        <TouchableOpacity
          onPress={handleAccountPress}
          style={styles.accountButton}>
          <CustomText style={styles.headerButtonText}>⚙️</CustomText>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {/* 보관 분류 + 식재료 유형 버튼 */}
        <View style={styles.leftTabGroup}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={handleStorageTypePress}>
            <CustomText style={styles.filterButtonText}>
              {activeStorageType} ▼
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={handleItemCategoryPress}>
            <CustomText style={styles.filterButtonText}>
              {activeItemCategory} ▼
            </CustomText>
          </TouchableOpacity>
        </View>

        <View style={styles.rightTabGroup}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isListEditMode && styles.actionButtonActive, // 🔧 조건부 스타일
            ]}
            onPress={() => setIsListEditMode(!isListEditMode)}>
            {' '}
            <CustomText
              style={[
                styles.actionButtonText,
                isListEditMode && styles.actionButtonTextActive, // 🔧 오타 수정 (acriont → action)
              ]}>
              편집하기
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>

      {/* 메인 콘텐츠 영역 */}
      <View style={styles.mainContent}>{renderTabContent()}</View>

      {/* 보관 분류 선택 모달 */}
      <Modal
        visible={isStorageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsStorageModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomText style={styles.modalTitle}>보관 분류</CustomText>

            {!isStorageEditMode ? (
              // 일반 모드: 선택만 가능
              <FlatList
                data={storageTypes}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      activeStorageType === item && {
                        backgroundColor: 'lightgray',
                      },
                    ]}
                    onPress={() => handleStorageTypeSelect(item)}>
                    <CustomText
                      style={[
                        styles.modalItemText,
                        activeStorageType === item && {fontWeight: 'bold'},
                      ]}>
                      {item}
                    </CustomText>
                    {activeStorageType === item && (
                      <CustomText style={styles.checkMark}>✓</CustomText>
                    )}
                  </TouchableOpacity>
                )}
              />
            ) : (
              // 편집 모드: 순서 변경, 삭제 가능
              //// 순서 변경 : react-native-draggable-flatlist 사용
              //// 삭제 기능 : 각 아이템 옆에 삭제 버튼 추가
              <DraggableFlatList
                data={storageTypes}
                onDragEnd={({data}) => setStorageTypes(data)}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, getIndex, drag, isActive}) => {
                  const index = getIndex();
                  return (
                    <View style={styles.editModeItem}>
                      <TouchableOpacity
                        style={styles.dragHandle}
                        onLongPress={drag}
                        disabled={isActive}>
                        <CustomText style={styles.dragHandleText}>≡</CustomText>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.editItemContent}>
                        <CustomText style={styles.modalItemText}>
                          {item}
                        </CustomText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDeleteStorageType(item)}>
                        <CustomText style={styles.deleteItemText}>
                          🗑️
                        </CustomText>
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            )}

            <View style={styles.modalButtons}>
              {!isStorageEditMode ? (
                <>
                  <TouchableOpacity
                    style={styles.editCategoryButton}
                    onPress={handleStorageEditToggle}>
                    <CustomText style={styles.editCategoryButtonText}>
                      보관 분류 편집
                    </CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsStorageModalVisible(false)}>
                    <CustomText style={styles.closeButtonText}>닫기</CustomText>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.addCategoryButton}
                    onPress={handleOpenAddStorageModal}>
                    <CustomText style={styles.addCategoryButtonText}>
                      + 보관 분류 추가
                    </CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => {
                      setIsStorageEditMode(false);
                      setIsStorageModalVisible(false);
                    }}>
                    <CustomText style={styles.confirmButtonText}>
                      확인
                    </CustomText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* 식재료 유형 선택 모달 */}
      <Modal
        visible={isItemCategoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsItemCategoryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomText style={styles.modalTitle}>식재료 유형</CustomText>

            <FlatList
              data={itemCategories}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleItemCategorySelect(item)}>
                  <CustomText style={styles.modalItemText}>{item}</CustomText>
                  {activeItemCategory === item && (
                    <CustomText style={styles.checkMark}>✓</CustomText>
                  )}
                </TouchableOpacity>
              )}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.editCategoryButton}>
                <CustomText style={styles.editCategoryButtonText}>
                  식재료 유형 편집
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsItemCategoryModalVisible(false)}>
                <CustomText style={styles.closeButtonText}>닫기</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 보관 분류 추가 모달 */}
      <Modal
        visible={isAddStorageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddStorageModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.addModalContent}>
            <CustomText style={styles.addModalTitle}>보관 분류 추가</CustomText>

            <TextInput
              style={styles.addModalInput}
              placeholder="보관 분류"
              value={newStorageName}
              onChangeText={setNewStorageName}
              autoFocus
            />

            <View style={styles.addModalButtons}>
              <TouchableOpacity
                style={styles.addModalCancelButton}
                onPress={() => {
                  setIsAddStorageModalVisible(false);
                  setNewStorageName('');
                }}>
                <CustomText>취소</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addModalConfirmButton}
                onPress={handleAddStorageType}>
                <CustomText>추가</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FridgeHomeScreen;
