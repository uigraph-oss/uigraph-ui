import { env } from '@/env'
import axios from 'axios'

export const clientAxios = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
})
