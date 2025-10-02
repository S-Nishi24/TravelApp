import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface DeleteAccountResponse {
  success?: boolean;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json<DeleteAccountResponse>(
        { error: "userIdが必要です" },
        { status: 400 }
      );
    }

    // --- 0. ユーザーの trips ID を取得 ---
    const { data: trips, error: tripsFetchError } = await supabaseAdmin
      .from("trips")
      .select("id")
      .eq("user_id", userId); // trips 側のユーザー参照列名に合わせる
    if (tripsFetchError) {
      console.error("trips取得エラー:", tripsFetchError);
      throw new Error(`trips取得失敗: ${tripsFetchError.message}`);
    }

    const tripIds = trips?.map(t => t.id) || [];

    // --- 1. expenses 削除 ---
    if (tripIds.length > 0) {
      const { error: expensesError } = await supabaseAdmin
        .from("expenses")
        .delete()
        .in("trip_id", tripIds); // expenses 側の trips 外部キー列名
      if (expensesError) {
        console.error("expenses削除エラー:", expensesError);
        throw new Error(`expenses削除失敗: ${expensesError.message}`);
      } else {
        console.log("expenses削除成功");
      }
    }

    // --- 2. trips 削除 ---
    const { error: tripsError } = await supabaseAdmin
      .from("trips")
      .delete()
      .eq("user_id", userId); // trips 側のユーザー参照列名
    if (tripsError) {
      console.error("trips削除エラー:", tripsError);
      throw new Error(`trips削除失敗: ${tripsError.message}`);
    } else {
      console.log("trips削除成功");
    }

    // --- 3. profiles 削除 ---
    const { error: profilesError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId); // profiles の主キー
    if (profilesError) {
      console.error("profiles削除エラー:", profilesError);
      throw new Error(`profiles削除失敗: ${profilesError.message}`);
    } else {
      console.log("profiles削除成功");
    }

    // --- 4. Authユーザー削除 ---
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error("Auth削除エラー:", authError);
      throw new Error(`Authユーザー削除失敗: ${authError.message}`);
    } else {
      console.log("Authユーザー削除成功");
    }

    return NextResponse.json<DeleteAccountResponse>({ success: true });
  } catch (err) {
    console.error("退会処理中のキャッチエラー:", err);
    return NextResponse.json<DeleteAccountResponse>(
      { error: err instanceof Error ? err.message : "退会処理中に不明なエラーが発生しました" },
      { status: 500 }
    );
  }
}
