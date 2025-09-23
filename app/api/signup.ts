import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// service_roleキーを使用して supabaseAdmin を作成
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password, username } = req.body;

  try {
    // ① Authentication にユーザー作成
    const { data: userData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      email_confirm: false,
    });

    if (signUpError) return res.status(400).json({ error: signUpError.message });

    // ② profiles テーブルに直接挿入
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({ id: userData.user.id, email, username });

    if (profileError) return res.status(400).json({ error: profileError.message });

    return res.status(200).json({ message: "ユーザー作成成功" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "サーバーエラー" });
  }
}
