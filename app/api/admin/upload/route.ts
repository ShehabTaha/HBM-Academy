import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;
    const pathPrefix = (formData.get("pathPrefix") as string) || "uploads";

    if (!file || !bucket) {
      return NextResponse.json(
        { error: "Missing file or bucket" },
        { status: 400 },
      );
    }

    // Validate size/type if needed (StorageService utils can help but we need buffer here)

    // Create Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const fileExt = file.name.split(".").pop();
    // Sanitize filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${pathPrefix}/${Date.now()}_${sanitizedName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Supabase Admin Upload Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error("[Admin Upload API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
