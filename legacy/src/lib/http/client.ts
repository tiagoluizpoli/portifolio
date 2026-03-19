import { env } from '@/config/env';
import axios from 'axios';

const { baseUrl, token } = env.backend;

export const httpClient = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    Authorization: `Bearer ${token}`,
  },
});
