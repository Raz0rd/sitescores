"use client"

import { useEffect, useState } from 'react'

export const useUtmParams = () => {
  const [utmParams, setUtmParams] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      
      // Capturar todos os parâmetros UTM e relacionados
      const utmParameters = [
        'utm_source',
        'utm_medium', 
        'utm_campaign',
        'utm_content',
        'utm_term',
        'src',
        'sck',
        'fbclid',
        'gclid',
        'ttclid',
        'xcod',
        'keyword',
        'device',
        'network',
        'gad_source',
        'gad_campaignid',
        'gbraid',
        'wbraid',
        'msclkid'
      ]

      const params = new URLSearchParams()
      
      utmParameters.forEach(param => {
        const value = urlParams.get(param)
        if (value) {
          params.set(param, value)
        }
      })

      const utmString = params.toString()
      setUtmParams(utmString)
      
      // Armazenar no localStorage E sessionStorage para persistir
      if (utmString) {
        localStorage.setItem('utmParams', utmString)
        
        // IMPORTANTE: Salvar cada parâmetro individualmente no sessionStorage
        // para o checkout conseguir recuperar
        utmParameters.forEach(param => {
          const value = urlParams.get(param)
          if (value) {
            sessionStorage.setItem(`utm_${param}`, value)
          }
        })
        
        console.log('✅ [UTM] Parâmetros salvos:', utmString)
      }
    }
  }, [])

  useEffect(() => {
    // Recuperar do localStorage se não houver na URL
    if (typeof window !== 'undefined' && !utmParams) {
      const stored = localStorage.getItem('utmParams')
      if (stored) {
        setUtmParams(stored)
      }
    }
  }, [utmParams])

  // Função para adicionar UTM params a uma URL
  const addUtmToUrl = (url: string): string => {
    if (!utmParams) return url
    
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}${utmParams}`
  }

  // Função para criar objeto de parâmetros para router.push
  const getUtmObject = (): Record<string, string> => {
    // SEMPRE tentar recuperar do localStorage primeiro
    if (typeof window !== 'undefined') {
      const obj: Record<string, string> = {}
      
      // Lista de parâmetros para recuperar
      const utmParameters = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
        'gclid', 'gbraid', 'wbraid', 'fbclid', 'keyword', 'device', 'network',
        'gad_source', 'gad_campaignid', 'src', 'sck', 'ttclid', 'xcod', 'msclkid'
      ]
      
      // Recuperar cada parâmetro do localStorage
      utmParameters.forEach(param => {
        const value = localStorage.getItem(param)
        if (value) {
          obj[param] = value
        }
      })
      
      // Se encontrou algo no localStorage, retornar
      if (Object.keys(obj).length > 0) {
        console.log('✅ [UTM] Recuperado do localStorage:', obj)
        return obj
      }
    }
    
    // Fallback: tentar do estado
    if (!utmParams) return {}
    
    const params = new URLSearchParams(utmParams)
    const obj: Record<string, string> = {}
    
    params.forEach((value, key) => {
      obj[key] = value
    })
    
    return obj
  }

  return {
    utmParams,
    addUtmToUrl,
    getUtmObject
  }
}
