import { createAuthActions } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("insforge_code");
  const oauthError = request.nextUrl.searchParams.get("error");
  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("insforge_code_verifier")?.value;

  if (oauthError || !code || !codeVerifier) {
    return NextResponse.redirect(new URL("/signin?error=google", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  const auth = createAuthActions({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });
  const { data, error } = await auth.exchangeOAuthCode(code, codeVerifier);

  if (error || !data?.user) {
    return NextResponse.redirect(new URL("/signin?error=google", request.url));
  }

  response.cookies.delete("insforge_code_verifier");
  return response;
}
