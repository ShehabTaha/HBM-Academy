import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentStudent, getPublicCourse } from "@/lib/services/student.service";
import { stripeService } from "@/lib/services/stripe.service";

const checkoutSchema = z.object({
  courseId: z.string().uuid(),
});

export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid course id" }, { status: 400 });

  const course = await getPublicCourse(parsed.data.courseId);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  if (Number(course.price) <= 0) {
    return NextResponse.json({ error: "Use free enrollment for this course." }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await stripeService.createCheckoutSession({
    userId: student.id,
    userEmail: student.email,
    courseId: course.id,
    courseTitle: course.title,
    price: Number(course.price),
    successUrl: `${appUrl}/courses/${course.slug || course.id}?checkout=success`,
    cancelUrl: `${appUrl}/courses/${course.slug || course.id}?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
