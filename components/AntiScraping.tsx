'use client'

import { useEffect } from 'react'

/**
 * Componente Anti-Scraping
 * Usa CSS para esconder conteúdo até JS carregar
 * Evita flash de conteúdo não estilizado
 */
export default function AntiScraping({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Conteúdo para bots sem JavaScript - substitui o loading */}
      <noscript>
        <style dangerouslySetInnerHTML={{__html: `
          .js-loading { display: none !important; }
        `}} />
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #f8fafc, #dbeafe, #e9d5ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            maxWidth: '42rem',
            width: '100%',
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h1 style={{fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>
              Plataforma de Eventos e Promoções
            </h1>
            <p style={{fontSize: '1.125rem', color: '#374151', marginBottom: '1.5rem'}}>
              Bem-vindo à nossa plataforma de eventos digitais e campanhas promocionais.
            </p>
            <div style={{marginTop: '2rem', fontSize: '0.875rem', color: '#6b7280'}}>
              <p>⚠️ Para acessar o conteúdo completo, habilite o JavaScript no seu navegador.</p>
            </div>
          </div>
        </div>
      </noscript>

      {/* Conteúdo real - escondido até JS carregar */}
      <div className="js-content">
        {children}
      </div>
    </>
  )
}
