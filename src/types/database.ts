export interface Database {
  public: {
    Tables: {
      runes: {
        Row: {
          id: string
          name: string
          symbol: string
          sound: string
          meaning: string
          keywords: string[]
          interpretation: string
          reversed_interpretation: string | null
          element: string | null
          aett: string | null
          position: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['runes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['runes']['Insert']>
      }
      daily_runes: {
        Row: {
          id: string
          user_id: string
          rune_id: string
          date: string
          orientation: string
          reflection: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['daily_runes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['daily_runes']['Insert']>
      }
      divinations: {
        Row: {
          id: string
          user_id: string
          divination_type: string
          runes: RuneSpread[]
          question: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['divinations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['divinations']['Insert']>
      }
      user_favorite_runes: {
        Row: {
          id: string
          user_id: string
          rune_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_favorite_runes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_favorite_runes']['Insert']>
      }
    }
  }
}

export interface Rune {
  id: string
  name: string
  symbol: string
  sound: string
  meaning: string
  keywords: string[]
  interpretation: string
  reversed_interpretation: string | null
  element: string | null
  aett: string | null
  position: number
}

export interface RuneSpread {
  rune_id: string
  position: 'past' | 'present' | 'future' | 'center' | 'top' | 'bottom' | 'left' | 'right' | string
  orientation: 'upright' | 'reversed'
}

export interface DailyRune {
  id: string
  user_id: string
  rune_id: string
  date: string
  orientation: string
  reflection: string | null
  notes: string | null
  created_at: string
  rune?: Rune
}

export interface Divination {
  id: string
  user_id: string
  divination_type: string
  runes: RuneSpread[]
  question: string | null
  notes: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: 'active' | 'canceled' | 'past_due' | 'inactive'
  price_id: string | null
  plan_type: 'monthly' | 'yearly' | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}
