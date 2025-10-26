import { NativeModules } from 'react-native';

interface ConfigModule {
  API_BASE_URL: string;
  NAVER_CLIENT_ID: string;
  NAVER_CLIENT_SECRET: string;
}

const Config: ConfigModule = NativeModules.Config || {
  API_BASE_URL: 'http://43.203.174.184:8080',
  NAVER_CLIENT_ID: '',
  NAVER_CLIENT_SECRET: '',
};

export default Config;
