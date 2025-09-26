
import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'pt-BR',
  title: 'br-date-lit',
  description: 'Datas úteis e feriados do Brasil',
  themeConfig: {
    logo: { light: '/logo-light.svg', dark: '/logo-dark.svg' },
    search: { provider: 'local' },
    nav: [
      { text: 'Guia', link: '/guia/instalacao' },
      { text: 'CLI', link: '/guia/cli' },
      { text: 'Dataset', link: '/guia/dataset' },
      { text: 'API', link: '/api/' }
    ],
    sidebar: {
      '/guia/': [
        { text: 'Introdução', link: '/guia/intro' },
        { text: 'Instalação', link: '/guia/instalacao' },
        { text: 'Uso Rápido', link: '/guia/uso-rapido' },
        { text: 'CLI', link: '/guia/cli' },
        { text: 'Referência da CLI', link: '/guia/cli-reference' },
        { text: 'Provedores', link: '/guia/providers' },
        { text: 'Dataset (UFs/Municípios)', link: '/guia/dataset' },
        { text: 'Hooks React', link: '/guia/react' },
        { text: 'Playground', link: '/guia/playground' },
      ],
      '/api/': [
        { text: 'Visão Geral', link: '/api/index' }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Ranilson-Nascimento/br-date-lit' }
    ],
    footer: {
      message: 'MIT License',
      copyright: '© ' + new Date().getFullYear() + ' br-date-lit'
    }
  },
  sitemap: { hostname: 'https://ranilson-nascimento.github.io/br-date-lit' },
  lastUpdated: true
})
