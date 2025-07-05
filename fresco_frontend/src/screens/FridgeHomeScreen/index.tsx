import React from 'react';
import {Text, SafeAreaView} from 'react-native';

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

  return (
    <SafeAreaView>
      {/* 뒤로가기 버튼 (냉장고 선택화면으로 나가기) 만들어야 함 : 좌측 상단*/}
      {/* 계정 관리 화면으로 넘어가는 버튼 우측 상단에 만들어야 함 */}
      {/* 네비게이션 바 만들어야함 : 하단*/}
      {/* */}
      <Text>냉장고 이름: {fridgeName}</Text>
      <Text>냉장고 ID: {fridgeId}</Text>
    </SafeAreaView>
  );
};

export default FridgeHomeScreen;
