import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("quote_requests")
    .select(`
      id,
      project_title,
      status,
      quantity,
      quote_amount,
      created_at,
      user_id,
      profiles(email)
    `)
    .order("created_at", { ascending: false });

  console.log("Admin GET /api/quote-requests - Raw data:", JSON.stringify(data, null, 2));
  console.log("Admin GET /api/quote-requests - Error:", error);
  console.log("Admin GET /api/quote-requests - Total records:", data?.length || 0);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formatted = (data || []).map((req: any) => ({
    id: req.id,
    project_title: req.project_title,
    status: req.status,
    quantity: req.quantity,
    quote_amount: req.quote_amount,
    created_at: req.created_at,
    user_id: req.user_id,
    email: req.profiles?.email || null,
  }));

  console.log("Admin GET /api/quote-requests - Formatted data:", JSON.stringify(formatted, null, 2));

  return NextResponse.json({ data: formatted }, { status: 200 });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("quote_requests")
    .insert({
      user_id: user.id,
      project_title: body.project_title,
      description: body.description,
      material: body.material || null,
      color: body.color || null,
      quantity: body.quantity,
      deadline: body.deadline || null,
      delivery_method: body.delivery_method,
      phone: body.phone,
      status: "Pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
