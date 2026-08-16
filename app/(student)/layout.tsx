import { StudentProvider } from "@/contexts/StudentContext";
import { StudentNavbar } from "@/components/student/StudentNavbar";
import { getCurrentStudent } from "@/lib/services/student.service";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const student = await getCurrentStudent();
  const dir = student?.language === "ar" ? "rtl" : "ltr";

  return (
    <StudentProvider initialStudent={student}>
      <div dir={dir} className="min-h-screen bg-app-bg">
        <StudentNavbar />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
    </StudentProvider>
  );
}
