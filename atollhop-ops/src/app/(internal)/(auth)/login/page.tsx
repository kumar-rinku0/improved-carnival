// app/login/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/login-form";

// Update the interface so that searchParams is a Promise that resolves to an object.
interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}

// Force dynamic rendering so that searchParams are always updated.
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Await searchParams before accessing its properties.
  const resolvedSearchParams = await searchParams;
  const callbackUrl = resolvedSearchParams.callbackUrl ?? "/";

  // Get the current session on the server.
  const session = await auth();
  if (session) {
    redirect(callbackUrl);
  }

  console.log("SERVER: Received searchParams:", resolvedSearchParams);

  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="h-4 w-4" />
          </div>
          demo
        </a>
        {/* Pass the resolved callbackUrl to the LoginForm */}
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
