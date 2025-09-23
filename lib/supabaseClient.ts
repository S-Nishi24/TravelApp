import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase環境変数が設定されていません。プロジェクト設定で環境変数を確認してください。")
}

// Supabaseクライアント設定
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, //セッション情報（認証トークンなど）をブラウザに紐づくローカルストレージに保存
    autoRefreshToken: true, // トークンの有効期限が近づいたら自動で更新する
    detectSessionInUrl: true, // URLにセッション情報がある場合、それを検出してログイン状態を初期化する
  },
})
