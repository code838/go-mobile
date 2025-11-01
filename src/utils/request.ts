import { OS_TYPE } from '@/constants/keys';
import { getState } from '@/store';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Toast from 'react-native-toast-message';

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

class HttpClient {
  private instance: AxiosInstance;

  constructor(baseURL?: string) {
    this.instance = axios.create({
      baseURL: baseURL || '',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      async (config) => {
        const state = getState();

        config.headers['Content-Type'] = 'application/json';
        config.headers['Accept'] = 'application/json';
        config.headers['OS-Type'] = OS_TYPE;
        
        // 添加Accept-Language头
        if (state.language) {
          config.headers['Accept-Language'] = state.language.includes('zh') ? 'zh_cn' : state.language.includes('en') ? 'en_us' : state.language;
        } else {
          config.headers['Accept-Language'] = 'zh_cn';
        }

        // 添加Authorization头
        if (state.token) {
          config.headers['Authorization'] = state.token;
        }

        console.log('config', config);

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response;
        console.log('response', response);
        // 如果后端返回的数据格式是统一的ApiResponse格式
        if (data.code === 0) {
          return response;
        } else {
          console.log('业务错误处理');
          console.log(data);
          return Promise.reject(new Error(data.msg));
        }
        
      },
      (error) => {
        console.log('error', error);
        console.log('error.message', error.message);
        Toast.show({
          type: 'error',
          text1: error.message,
        });
      }
    );
  }

  // GET请求
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.get(url, config);
  }

  // POST请求
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    console.log('post', url, data);
    return this.instance.post(url, data, config);
  }

  // 文件上传
  upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // 获取原始axios实例，用于特殊情况
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// 创建默认实例
const httpClient = new HttpClient();

// 导出实例和类，方便使用
export default httpClient;
export { HttpClient };

// 便捷方法
export const request = httpClient;
export const { get, post } = httpClient;