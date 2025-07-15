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

// Detectar se estamos em ambiente Cloudflare Workers
const isCloudflareWorker = typeof globalThis !== 'undefined' && 
                          'D1Database' in globalThis && 
                          typeof window === 'undefined';

if (isCloudflareWorker) {
  // Em Cloudflare Workers, D1Database estará disponível globalmente
  console.log('Cloudflare Worker environment detected');
  // O D1Database será injetado pelo Cloudflare Workers
  initialize();
} else {
  // Em browser ou desenvolvimento local
  console.log('Browser or local development environment detected');
  initialize();
}

app.mount('#app')
