import type { NextApiRequest, NextApiResponse } from 'next'
import { createOrder } from '@/lib/supabase/orders'

/**
 * API para criar pedidos
 * POST /api/orders
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { theme_id, customer_name, customer_email, notes } = req.body

  // Validação básica
  if (!theme_id || !customer_name || !customer_email) {
    return res.status(400).json({ error: 'Campos obrigatórios: theme_id, customer_name, customer_email' })
  }

  // Criar pedido com status pending
  const order = await createOrder({
    theme_id,
    customer_name,
    customer_email,
    notes,
    status: 'pending',
  })

  if (!order) {
    return res.status(500).json({ error: 'Erro ao criar pedido' })
  }

  return res.status(201).json({ order })
}
