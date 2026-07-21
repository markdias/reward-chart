import { getSupabaseClient } from './supabase';
import { Network } from '@capacitor/network';

export type SyncAction = 'insert' | 'update' | 'delete' | 'upsert';

export interface SyncMatchOptions {
  eq?: Record<string, any>;
  in?: { column: string; values: any[] };
  or?: string;
  onConflict?: string;
}

export interface SyncOperation {
  id: string;
  timestamp: number;
  table: string;
  action: SyncAction;
  payload: any;
  match?: SyncMatchOptions;
}

const QUEUE_KEY = 'RCH_SYNC_QUEUE';

/**
 * Gets the current queue from localStorage.
 */
export const getSyncQueue = (): SyncOperation[] => {
  const queueStr = localStorage.getItem(QUEUE_KEY);
  if (!queueStr) return [];
  try {
    return JSON.parse(queueStr) as SyncOperation[];
  } catch (e) {
    console.error('Failed to parse sync queue', e);
    return [];
  }
};

/**
 * Saves the queue to localStorage.
 */
export const saveSyncQueue = (queue: SyncOperation[]) => {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

/**
 * Adds an operation to the sync queue.
 */
export const queueOperation = (
  table: string,
  action: SyncAction,
  payload: any,
  match?: SyncMatchOptions
) => {
  const op: SyncOperation = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    table,
    action,
    payload,
    match
  };
  
  const queue = getSyncQueue();
  queue.push(op);
  saveSyncQueue(queue);
  console.log(`[OfflineSync] Queued operation: ${action} on ${table}`, op);
};

const applyMatch = (query: any, match?: SyncMatchOptions) => {
  if (!match) return query;
  let q = query;
  if (match.eq) {
    Object.entries(match.eq).forEach(([k, v]) => {
      q = q.eq(k, v);
    });
  }
  if (match.in) {
    q = q.in(match.in.column, match.in.values);
  }
  if (match.or) {
    q = q.or(match.or);
  }
  return q;
};

/**
 * Attempts to execute a database operation immediately.
 * If the device is offline or the request fails with a network error, 
 * the operation is queued for later.
 */
export const executeOrQueue = async (
  table: string,
  action: SyncAction,
  payload: any,
  match?: SyncMatchOptions
): Promise<{ success: boolean; queued: boolean; error?: any }> => {
  try {
    const status = await Network.getStatus();
    
    // If explicitly offline, queue immediately without trying
    if (!status.connected) {
      queueOperation(table, action, payload, match);
      return { success: true, queued: true };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: true, queued: false };
    }

    let cleanPayload = { ...payload };
    
    // Strip local-only fields that are not yet in the Supabase schema
    if (table === 'children') {
      const localOnlyFields = [
        'level_up_bonuses_received',
        'pet_fed_total',
        'pet_happy_streak',
        'savings_deposits',
        'savings_goals_met',
        'gifts_made',
        'gold_pot_fixes',
        'gold_pot_unbroken_days',
        'manual_deductions'
      ];
      localOnlyFields.forEach(field => {
        if (field in cleanPayload) {
          delete cleanPayload[field];
        }
      });
    }

    let query: any = supabase.from(table);
    
    switch (action) {
      case 'insert':
        query = query.insert(cleanPayload);
        break;
      case 'upsert':
        if (match && match.onConflict) {
          query = query.upsert(cleanPayload, { onConflict: match.onConflict });
        } else {
          query = query.upsert(cleanPayload);
        }
        break;
      case 'update':
        query = applyMatch(query.update(cleanPayload), match);
        break;
      case 'delete':
        query = applyMatch(query.delete(), match);
        break;
    }

    const { error } = await query;

    if (error) {
      if (error.message && error.message.includes('Failed to fetch')) {
        console.warn(`[OfflineSync] Network error on ${action} ${table}, queuing operation.`);
        queueOperation(table, action, payload, match);
        return { success: true, queued: true };
      }
      console.error(`[OfflineSync] Supabase error on ${action} ${table}:`, error);
      return { success: false, queued: false, error };
    }

    return { success: true, queued: false };
    
  } catch (err: any) {
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('Network'))) {
      console.warn(`[OfflineSync] Caught network error on ${action} ${table}, queuing operation.`);
      queueOperation(table, action, payload, match);
      return { success: true, queued: true };
    }
    console.error(`[OfflineSync] Unexpected error on ${action} ${table}:`, err);
    return { success: false, queued: false, error: err };
  }
};

/**
 * Processes all operations in the sync queue.
 * Stops processing on the first network failure to preserve order.
 */
export const processSyncQueue = async () => {
  const queue = getSyncQueue();
  if (queue.length === 0) return;

  const status = await Network.getStatus();
  if (!status.connected) {
    console.log('[OfflineSync] Attempted to process queue, but device is still offline.');
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return;

  console.log(`[OfflineSync] Processing ${queue.length} queued operations...`);
  
  let successfulOps = 0;
  const remainingQueue = [...queue];

  for (const op of queue) {
    try {
      let query: any = supabase.from(op.table);
      
      switch (op.action) {
        case 'insert':
          query = query.insert(op.payload);
          break;
        case 'upsert':
          if (op.match && op.match.onConflict) {
            query = query.upsert(op.payload, { onConflict: op.match.onConflict });
          } else {
            query = query.upsert(op.payload);
          }
          break;
        case 'update':
          query = applyMatch(query.update(op.payload), op.match);
          break;
        case 'delete':
          query = applyMatch(query.delete(), op.match);
          break;
      }

      const { error } = await query;

      if (error) {
        console.error(`[OfflineSync] Failed to sync operation ${op.id} (${op.action} ${op.table}):`, error);
        if (error.message && error.message.includes('Failed to fetch')) {
          break;
        } else {
          remainingQueue.shift();
        }
      } else {
        successfulOps++;
        remainingQueue.shift();
      }
    } catch (err: any) {
       console.error(`[OfflineSync] Caught error processing ${op.id}:`, err);
       if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('Network'))) {
         break;
       } else {
         remainingQueue.shift();
       }
    }
  }

  saveSyncQueue(remainingQueue);
  if (successfulOps > 0) {
    console.log(`[OfflineSync] Successfully synced ${successfulOps} operations.`);
  }
};
