export interface Endpoint {
  url: string;
  method: 'POST' | 'GET' | 'PUT';
  signature?: any;
}
