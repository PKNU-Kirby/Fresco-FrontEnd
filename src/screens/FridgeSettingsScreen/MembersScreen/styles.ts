import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');

// iPhone 16 Pro
const baseWidth = 402;
//const baseHeight = 874;

// 반응형 함수
//const wp = (percentage: number) => (width * percentage) / 100;
//const hp = (percentage: number) => (height * percentage) / 100;
const scale = (size: number) => (width / baseWidth) * size;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E8',
  },
  // header style
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: scale(60),
    backgroundColor: '#e8f5e8',
    paddingHorizontal: scale(16),
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8,
    paddingBottom: scale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: scale(0),
      height: scale(5),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(3.84),
    elevation: 5,
    zIndex: 1001,
  },
  leftSection: {
    width: scale(56),
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scale(8),
  },
  rightSection: {
    width: scale(56),
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    maxWidth: '100%',
  },
  settingsContainer: {
    flex: 1,
    paddingTop: scale(24),
  },
  // Loading style
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: scale(14),
    color: '#6B7280',
  },

  // 설정 그룹
  settingsGroup: {
    backgroundColor: 'white',
    marginBottom: scale(16),
    borderRadius: scale(12),
    marginHorizontal: scale(16),
    paddingVertical: scale(8),
    overflow: 'hidden',
  },
  fridgeInfoHeader: {
    alignItems: 'center',
    paddingVertical: scale(24),
    borderRadius: scale(12),
    marginHorizontal: scale(16),
  },
  fridgeTitle: {
    fontSize: scale(20),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: scale(8),
  },
  memberCount: {
    fontSize: scale(14),
    color: '#666',
  },
  // 그룹 헤더
  groupHeader: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
  },
  groupTitle: {
    fontSize: scale(18),
    fontWeight: '900',
    color: '#333',
  },

  // 빈 멤버 상태
  emptyMemberContainer: {
    alignItems: 'center',
    paddingVertical: scale(32),
    paddingHorizontal: scale(16),
  },
  emptyMemberText: {
    fontSize: scale(16),
    color: '#666',
    textAlign: 'center',
  },

  // 안내사항
  infoContainer: {
    borderRadius: scale(8),
    paddingHorizontal: scale(8),
    paddingBottom: scale(4),
    margin: scale(16),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: scale(15),
    color: '#4B5563',
    lineHeight: scale(20),
    marginLeft: scale(8),
  },
});
