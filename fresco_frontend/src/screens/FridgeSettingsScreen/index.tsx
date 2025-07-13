import React from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import CustomText from '../../components/common/CustomText';
import {RootStackParamList} from '../../../App';
import {styles} from './styles';

type Props = {
  route: {
    params: {
      fridgeId: number;
      fridgeName: string;
      userRole?: 'owner' | 'member';
    };
  };
};

const FridgeSettingsScreen = ({route}: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {fridgeId, fridgeName, userRole = 'owner'} = route.params;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleMemberManage = () => {
    console.log('구성원 관리');
    // navigation.navigate('MemberManageScreen', {fridgeId});
  };

  const handleMemberInvite = () => {
    console.log('구성원 초대');
    // 링크 공유 로직
  };

  const handleUsageHistory = () => {
    console.log('사용 기록');
    // navigation.navigate('UsageHistoryScreen', {fridgeId});
  };

  const handleFridgeNameEdit = () => {
    console.log('냉장고 이름 변경');
  };

  const handleFridgeDelete = () => {
    Alert.alert(
      '냉장고 삭제',
      '정말로 이 냉장고를 삭제하시겠습니까?\n모든 데이터가 사라집니다.',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => console.log('냉장고 삭제'),
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {text: '로그아웃', onPress: () => console.log('로그아웃')},
    ]);
  };

  const handleLeaveFridge = () => {
    Alert.alert('냉장고 나가기', '이 냉장고에서 나가시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => console.log('냉장고 나가기'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <CustomText style={styles.headerButton}>뒤로</CustomText>
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>냉장고 설정</CustomText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 냉장고 정보 */}
        <View style={styles.section}>
          <View style={styles.fridgeInfo}>
            <CustomText style={styles.fridgeName}>{fridgeName}</CustomText>
            <CustomText style={styles.userRole}>
              {userRole === 'owner' ? '냉장고 주인' : '구성원'}
            </CustomText>
          </View>
        </View>

        {/* 구성원 관리 섹션 */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>구성원</CustomText>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleMemberManage}>
            <CustomText style={styles.menuItemText}>구성원 관리</CustomText>
            <CustomText style={styles.menuItemArrow}>›</CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleMemberInvite}>
            <CustomText style={styles.menuItemText}>구성원 초대</CustomText>
            <CustomText style={styles.menuItemArrow}>›</CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleUsageHistory}>
            <CustomText style={styles.menuItemText}>
              식재료 사용 기록
            </CustomText>
            <CustomText style={styles.menuItemArrow}>›</CustomText>
          </TouchableOpacity>
        </View>

        {/* 냉장고 설정 섹션 (주인만) */}
        {userRole === 'owner' && (
          <View style={styles.section}>
            <CustomText style={styles.sectionTitle}>냉장고 설정</CustomText>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleFridgeNameEdit}>
              <CustomText style={styles.menuItemText}>
                냉장고 이름 변경
              </CustomText>
              <CustomText style={styles.menuItemArrow}>›</CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={handleFridgeDelete}>
              <CustomText style={[styles.menuItemText, styles.menuItemDanger]}>
                냉장고 삭제
              </CustomText>
              <CustomText style={styles.menuItemArrow}>›</CustomText>
            </TouchableOpacity>
          </View>
        )}

        {/* 계정 섹션 */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>계정</CustomText>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <CustomText style={styles.menuItemText}>로그아웃</CustomText>
            <CustomText style={styles.menuItemArrow}>›</CustomText>
          </TouchableOpacity>

          {userRole === 'member' && (
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={handleLeaveFridge}>
              <CustomText style={[styles.menuItemText, styles.menuItemDanger]}>
                냉장고 나가기
              </CustomText>
              <CustomText style={styles.menuItemArrow}>›</CustomText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FridgeSettingsScreen;
