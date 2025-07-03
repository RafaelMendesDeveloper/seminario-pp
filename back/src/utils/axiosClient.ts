import axios, { AxiosInstance } from "axios";

class AxiosClient {
  private client: AxiosInstance;

  constructor(baseURL: string, apiKey: string) {
    this.client = axios.create({
      baseURL,
      headers: { "X-API-Key": apiKey },
    });
  }

  get<T = any>(url: string) {
    return this.client.get<T>(url);
  }
}

const fbrClient = new AxiosClient(
  "https://fbrapi.com",
  "Ii0fUgEG3bykYyxmRgUGP7XgosWW4_PxUYkBqfYhbAo"
);
export default fbrClient;
