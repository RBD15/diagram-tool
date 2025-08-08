import axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";

export class RequestClient {
    private client: AxiosInstance
    constructor(baseURL: string, config?: AxiosRequestConfig) {
        this.client = axios.create({
            baseURL,
            ...config
        })
    }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosPromise<T>> {
    return this.client.get<T>(url, config);
  }

  public async post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public async put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

}