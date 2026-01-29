import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, recipients } = await req.json();

    // In a real implementation, this would call your email provider (Resend, SendGrid, etc.)
    console.log(`[TEST NOTIFICATION] Type: ${type}`);
    console.log(`[TEST NOTIFICATION] Recipients:`, recipients);

    // Mock success delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: `Test email (${type}) sent to ${(recipients || []).length} recipients.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 },
    );
  }
}
