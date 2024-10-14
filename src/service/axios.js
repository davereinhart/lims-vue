// @ts-check
import { useAuthStore } from '@/stores'
import axios from 'axios'
import createAuthRefreshInterceptor from 'axios-auth-refresh'


axios.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const refreshUrl = `${import.meta.env.VITE_API_URL}/api/user/refresh`
  const token = config.url == refreshUrl ? authStore?.user?.refreshToken : authStore?.user?.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const refreshAuthLogic = async (failedRequest) => {
  const authStore = useAuthStore()
  if (!!authStore?.user?.refreshToken) {
    try {
      const authResponse = await authStore.refresh()
      failedRequest.config.headers['Authorization'] = `Bearer ${authResponse.accessToken}`
    } catch (err) {
      authStore.logout()
    }
  } else {
    authStore.logout()
  }
}

createAuthRefreshInterceptor(axios, refreshAuthLogic)
