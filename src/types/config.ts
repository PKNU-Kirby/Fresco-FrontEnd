import { NativeModules } from 'react-native';

interface ConfigModule {
  API_BASE_URL: string;
  NAVER_CLIENT_ID: string;
  NAVER_CLIENT_SECRET: string;
}

const Config: ConfigModule = NativeModules.Config || {
  API_BASE_URL: 'http://43.203.174.184:8080',
  NAVER_CLIENT_ID: 'veFZeOEWZDxbR0JzucSH',
  NAVER_CLIENT_SECRET: 'o1a3B6QVcs',
};

export default Config;
