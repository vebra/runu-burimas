// Stub for @supabase/realtime-js — project doesn't use Realtime
// This saves ~96KB from the bundle
export class RealtimeClient {
  constructor() {}
  connect() { return this }
  disconnect() { return this }
  setAuth() { return this }
  channel() { return this }
  removeChannel() { return this }
  removeAllChannels() { return this }
  getChannels() { return [] }
}

export class RealtimeChannel {
  constructor() {}
  subscribe() { return this }
  unsubscribe() { return this }
  on() { return this }
  send() { return this }
}

export const REALTIME_LISTEN_TYPES = {
  BROADCAST: 'broadcast',
  PRESENCE: 'presence',
  POSTGRES_CHANGES: 'postgres_changes',
}

export const REALTIME_PRESENCE_LISTEN_EVENTS = {
  SYNC: 'sync',
  JOIN: 'join',
  LEAVE: 'leave',
}

export const REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = {
  ALL: '*',
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
}

export const REALTIME_SUBSCRIBE_STATES = {
  SUBSCRIBED: 'SUBSCRIBED',
  TIMED_OUT: 'TIMED_OUT',
  CLOSED: 'CLOSED',
  CHANNEL_ERROR: 'CHANNEL_ERROR',
}
