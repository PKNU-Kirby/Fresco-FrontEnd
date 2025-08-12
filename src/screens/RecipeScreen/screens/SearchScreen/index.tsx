import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RecipeStackParamList } from '../../RecipeNavigator';
import { SearchHistoryStorage } from '../../../../utils/AsyncStorageUtils';
import { styles } from './styles';

type SearchScreenNavigationProp = NativeStackNavigationProp<
  RecipeStackParamList,
  'Search'
>;
type SearchScreenRouteProp = RouteProp<RecipeStackParamList, 'Search'>;

interface SearchScreenProps {}

const SearchScreen: React.FC<SearchScreenProps> = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const route = useRoute<SearchScreenRouteProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const searchInputRef = useRef<TextInput>(null);

  // 🔧 초기 데이터 로드
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const storedHistory = await SearchHistoryStorage.getSearchHistory();
        setSearchHistory(storedHistory);
      } catch (error) {
        console.error('검색 히스토리 로드 실패:', error);
      }
    };

    loadSearchHistory();
  }, []);

  // 화면 마운트 시 자동 포커스
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 뒤로가기
  const handleBack = () => {
    Keyboard.dismiss();
    navigation.navigate('RecipeHome' as never);
  };

  // 🔧 검색 실행 (AsyncStorage 연결)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      // 검색 히스토리 업데이트 및 저장
      const newHistory = await SearchHistoryStorage.addSearchQuery(searchQuery);
      setSearchHistory(newHistory);

      // 검색 결과 화면으로 이동
      navigation.replace('SearchResult', { query: searchQuery });
    } catch (error) {
      console.error('검색 히스토리 저장 실패:', error);
      // 에러가 나도 검색은 진행
      navigation.replace('SearchResult', { query: searchQuery });
    }
  };

  // 🔧 검색 히스토리 항목 클릭 (AsyncStorage 연결)
  const handleHistoryItemPress = async (item: string) => {
    setSearchQuery(item);

    try {
      // 검색 히스토리 업데이트
      const newHistory = await SearchHistoryStorage.addSearchQuery(item);
      setSearchHistory(newHistory);
      navigation.replace('SearchResult', { query: item });
    } catch (error) {
      console.error('검색 히스토리 업데이트 실패:', error);
      navigation.replace('SearchResult', { query: item });
    }
  };

  // 🔧 검색 히스토리 항목 삭제 (AsyncStorage 연결)
  const removeHistoryItem = async (item: string) => {
    try {
      const newHistory = await SearchHistoryStorage.removeSearchQuery(item);
      setSearchHistory(newHistory);
    } catch (error) {
      console.error('검색 히스토리 항목 삭제 실패:', error);
    }
  };

  // 🔧 검색 히스토리 전체 삭제 (AsyncStorage 연결)
  const clearAllHistory = async () => {
    try {
      await SearchHistoryStorage.clearSearchHistory();
      setSearchHistory([]);
    } catch (error) {
      console.error('검색 히스토리 전체 삭제 실패:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 검색 헤더 */}
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.searchInputContainer}>
          <Icon
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Title, text, hashtag"
            placeholderTextColor="#999"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      {/* 최근 검색어 */}
      <View style={styles.recentSearchContainer}>
        <View style={styles.recentSearchHeader}>
          <Text style={styles.recentSearchTitle}>Recent searches</Text>
          {searchHistory.length > 0 && (
            <TouchableOpacity onPress={clearAllHistory}>
              <Text style={styles.deleteAllText}>Delete all</Text>
            </TouchableOpacity>
          )}
        </View>

        {searchHistory.length > 0 ? (
          <View style={styles.historyContainer}>
            {searchHistory.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.historyItem}
                onPress={() => handleHistoryItemPress(item)}
              >
                <Text style={styles.historyText}>{item}</Text>
                <TouchableOpacity
                  style={styles.removeHistoryButton}
                  onPress={() => removeHistoryItem(item)}
                >
                  <Icon name="close" size={16} color="#666" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyHistoryContainer}>
            <Text style={styles.emptyHistoryText}>검색 기록이 없습니다</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;
