import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sendEmail } from "@/lib/services/email.service";

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

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: "No recipients provided" }, { status: 400 });
    }

    let successCount = 0;
    for (const email of recipients) {
      const result = await sendEmail({
        to: email,
        subject: "Test Notification - HBM Academy",
        html: `<p>This is a test notification from your HBM Academy Admin Panel.</p><p>Type: <strong>${type}</strong></p>`,
        text: `This is a test notification from your HBM Academy Admin Panel.\nType: ${type}`,
      });
      if (result.success) {
        successCount++;
      }
    }

    if (successCount === 0) {
       return NextResponse.json({ error: "Failed to send to any recipients" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Test email (${type}) sent to ${successCount} recipients.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 },
    );
  }
}
