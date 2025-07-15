import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useDatabase } from './hooks/useDatabase'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Inicializar banco de dados
const { initialize } = useDatabase();

// Em Cloudflare Pages, o browser sempre usa API endpoints
// O D1Database só está disponível nas Pages Functions (API routes)
console.log('Initializing database service for browser environment');
initialize();

app.mount('#app')
