import axios from 'axios'

const TOKEN_KEY = 'linitech_token'

const http = axios.create({ baseURL: '/api' })

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export const authApi = {
  login: (username, password, role) => http.post('/auth/login', { username, password, role }),
}

export const employeesApi = {
  list: () => http.get('/employees/'),
  get: (id) => http.get(`/employees/${id}`),
  create: (data) => http.post('/employees/', data),
  update: (id, data) => http.put(`/employees/${id}`, data),
  remove: (id) => http.delete(`/employees/${id}`),
  regenerate: (id) => http.post(`/employees/${id}/regenerate-credentials`),
}

export const checklistApi = {
  get: (employeeId) => http.get(`/checklist/${employeeId}`),
  progress: (employeeId) => http.get(`/checklist/${employeeId}/progress`),
  updateItem: (itemId, completed) => http.put(`/checklist/item/${itemId}`, { completed }),
}

export const equipmentApi = {
  list: () => http.get('/equipment/'),
  create: (data) => http.post('/equipment/', data),
  update: (id, data) => http.put(`/equipment/${id}`, data),
  remove: (id) => http.delete(`/equipment/${id}`),
  assign: (id, employeeId) => http.post(`/equipment/${id}/assign`, { employee_id: employeeId }),
  return: (id) => http.post(`/equipment/${id}/return`),
}

export const dashboardApi = {
  stats: () => http.get('/dashboard/stats'),
  recent: () => http.get('/dashboard/recent'),
}

export const logsApi = {
  list: (entity) => http.get('/logs/', { params: entity ? { entity } : {} }),
}

export default http
