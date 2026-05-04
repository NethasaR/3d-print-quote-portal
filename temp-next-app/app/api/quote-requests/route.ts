import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
