import supabase from './client'
import { Order } from '../types'

/**
 * Funções de acesso à tabela orders (pedidos)
 */

// Cria um novo pedido
export async function createOrder(payload: Partial<Order>): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .insert(payload)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar pedido:', error)
    return null
  }
  return data as Order
}

// Lista todos os pedidos (admin)
export async function listOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, themes(name)')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Erro ao listar pedidos:', error)
    return []
  }
  return (data || []) as Order[]
}

// Atualiza o status de um pedido
export async function updateOrderStatus(
  id: string, 
  status: Order['status']
): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar status do pedido:', error)
    return null
  }
  return data as Order
}
