/**
 * 📥 API DE DOWNLOAD DO TEMA
 * 
 * Endpoint para download do pacote do tema após pagamento confirmado.
 * Valida se o pedido está pago antes de permitir o download.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { generateThemePackage, packageToJSON, packageToZipBuffer } from '@/lib/theme-package'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface DownloadQuery {
  order_id: string
  format?: 'json' | 'zip'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apenas GET é permitido
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { order_id, format = 'json' } = req.query as unknown as DownloadQuery

    if (!order_id) {
      return res.status(400).json({ error: 'order_id é obrigatório' })
    }

    // Buscar pedido
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status, theme_id, customer_email, license_type')
      .eq('id', order_id)
      .maybeSingle()

    if (orderError || !order) {
      return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    // Verificar se pagamento foi confirmado
    if (order.status !== 'paid' && order.status !== 'delivered') {
      return res.status(403).json({ 
        error: 'Download não disponível',
        message: 'O pagamento ainda não foi confirmado',
        status: order.status 
      })
    }

    // Gerar pacote do tema
    const themePackage = await generateThemePackage(
      order.theme_id,
      order.license_type || 'single-site'
    )

    // Atualizar status para entregue (se ainda não foi)
    if (order.status === 'paid') {
      await supabaseAdmin
        .from('orders')
        .update({ 
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', order_id)
    }

    // Retornar no formato solicitado
    if (format === 'zip') {
      // Para ZIP, retornamos a estrutura de arquivos
      // Em produção, usar JSZip para gerar o arquivo
      const zipStructure = await packageToZipBuffer(themePackage)
      
      res.setHeader('Content-Type', 'application/json')
      res.setHeader(
        'Content-Disposition', 
        `attachment; filename="${themePackage.meta.slug}-package.json"`
      )
      
      return res.status(200).json({
        message: 'Para gerar o ZIP, implemente JSZip no frontend',
        files: zipStructure.files,
      })
    }

    // Formato JSON (padrão)
    const jsonContent = packageToJSON(themePackage)

    res.setHeader('Content-Type', 'application/json')
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename="${themePackage.meta.slug}-theme.json"`
    )

    return res.status(200).send(jsonContent)

  } catch (error) {
    console.error('❌ Erro ao gerar download:', error)
    return res.status(500).json({ 
      error: 'Erro ao gerar pacote do tema',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}
