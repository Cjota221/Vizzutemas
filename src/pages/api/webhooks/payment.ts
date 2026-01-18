/**
 * 🔔 WEBHOOK DE PAGAMENTO
 * 
 * Este endpoint recebe notificações de pagamento (Stripe, Mercado Pago, etc.)
 * e atualiza o status do pedido no Supabase.
 * 
 * IMPORTANTE: Em produção, você DEVE:
 * 1. Validar a assinatura do webhook (Stripe: stripe-signature header)
 * 2. Verificar se o evento é de um ambiente válido (test vs live)
 * 3. Implementar idempotência para evitar processamento duplicado
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Cliente Supabase com service role para operações admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Tipos de eventos suportados
type PaymentEvent = 
  | 'payment.success'
  | 'payment.failed'
  | 'payment.pending'
  | 'payment.refunded'
  | 'payment.cancelled'

// Payload do webhook
interface WebhookPayload {
  event: PaymentEvent
  data: {
    order_id: string
    payment_id?: string
    amount?: number
    currency?: string
    customer_email?: string
    metadata?: Record<string, any>
  }
  timestamp: string
  signature?: string
}

// Response padrão
interface WebhookResponse {
  success: boolean
  message: string
  order_id?: string
  new_status?: string
}

/**
 * Valida a assinatura do webhook
 * Adapte para o seu provedor de pagamento (Stripe, MP, etc.)
 */
function validateWebhookSignature(
  payload: string,
  signature: string | undefined,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.warn('⚠️ Assinatura ou secret não fornecido - modo de desenvolvimento')
    return process.env.NODE_ENV !== 'production'
  }

  // Exemplo para Stripe: HMAC-SHA256
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  // Comparação segura contra timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(`sha256=${expectedSignature}`)
    )
  } catch {
    return false
  }
}

/**
 * Mapeia evento de pagamento para status do pedido
 */
function mapEventToStatus(event: PaymentEvent): string {
  const statusMap: Record<PaymentEvent, string> = {
    'payment.success': 'paid',
    'payment.failed': 'cancelled',
    'payment.pending': 'pending',
    'payment.refunded': 'refunded',
    'payment.cancelled': 'cancelled',
  }
  return statusMap[event] || 'pending'
}

/**
 * Processa o webhook de pagamento
 */
async function processPaymentWebhook(payload: WebhookPayload): Promise<WebhookResponse> {
  const { event, data } = payload

  // Validar dados obrigatórios
  if (!data.order_id) {
    return {
      success: false,
      message: 'order_id é obrigatório',
    }
  }

  // Buscar pedido existente
  const { data: existingOrder, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('id, status, theme_id, customer_email')
    .eq('id', data.order_id)
    .maybeSingle()

  if (fetchError) {
    console.error('❌ Erro ao buscar pedido:', fetchError)
    return {
      success: false,
      message: `Erro ao buscar pedido: ${fetchError.message}`,
    }
  }

  if (!existingOrder) {
    return {
      success: false,
      message: `Pedido ${data.order_id} não encontrado`,
    }
  }

  // Determinar novo status
  const newStatus = mapEventToStatus(event)

  // Verificar se é uma transição válida
  const validTransitions: Record<string, string[]> = {
    pending: ['paid', 'cancelled'],
    paid: ['refunded', 'delivered'],
    cancelled: [], // Terminal state
    refunded: [], // Terminal state
    delivered: [], // Terminal state
  }

  const currentStatus = existingOrder.status || 'pending'
  const allowedNextStatuses = validTransitions[currentStatus] || []

  if (!allowedNextStatuses.includes(newStatus) && currentStatus !== newStatus) {
    console.warn(`⚠️ Transição inválida: ${currentStatus} → ${newStatus}`)
    // Permitir em desenvolvimento, mas logar warning
    if (process.env.NODE_ENV === 'production') {
      return {
        success: false,
        message: `Transição de status inválida: ${currentStatus} → ${newStatus}`,
        order_id: data.order_id,
      }
    }
  }

  // Atualizar status do pedido
  const { data: updatedOrder, error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: newStatus,
      payment_id: data.payment_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.order_id)
    .select()
    .single()

  if (updateError) {
    console.error('❌ Erro ao atualizar pedido:', updateError)
    return {
      success: false,
      message: `Erro ao atualizar pedido: ${updateError.message}`,
    }
  }

  console.log(`✅ Pedido ${data.order_id} atualizado: ${currentStatus} → ${newStatus}`)

  // Se pagamento confirmado, disparar ações pós-pagamento
  if (event === 'payment.success') {
    // TODO: Enviar email com link de download
    // TODO: Gerar link de download temporário
    // TODO: Registrar analytics
    console.log(`🎉 Pagamento confirmado para pedido ${data.order_id}`)
  }

  return {
    success: true,
    message: `Pedido atualizado com sucesso`,
    order_id: data.order_id,
    new_status: newStatus,
  }
}

/**
 * Handler principal do webhook
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebhookResponse | { error: string }>
) {
  // Apenas POST é permitido
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Obter payload raw para validação de assinatura
    const rawBody = JSON.stringify(req.body)
    const signature = req.headers['x-webhook-signature'] as string | undefined
    const webhookSecret = process.env.WEBHOOK_SECRET || ''

    // Validar assinatura (em produção)
    if (process.env.NODE_ENV === 'production') {
      const isValid = validateWebhookSignature(rawBody, signature, webhookSecret)
      if (!isValid) {
        console.error('❌ Assinatura de webhook inválida')
        return res.status(401).json({ error: 'Invalid webhook signature' })
      }
    }

    // Parsear payload
    const payload = req.body as WebhookPayload

    // Validar estrutura básica
    if (!payload.event || !payload.data) {
      return res.status(400).json({ error: 'Invalid payload structure' })
    }

    // Processar webhook
    const result = await processPaymentWebhook(payload)

    // Retornar resposta
    if (result.success) {
      return res.status(200).json(result)
    } else {
      return res.status(400).json(result)
    }

  } catch (error) {
    console.error('❌ Erro no webhook de pagamento:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
    })
  }
}

// Desabilitar body parser para acesso ao raw body (necessário para validação Stripe)
export const config = {
  api: {
    bodyParser: true, // Mudar para false se precisar de raw body para Stripe
  },
}
