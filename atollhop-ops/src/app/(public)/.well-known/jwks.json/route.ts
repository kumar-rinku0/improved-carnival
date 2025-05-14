import { NextResponse } from "next/server";

export async function GET() {
  const publicKeyJson = process.env.PUBLIC_KEY_JWK;
  if (!publicKeyJson) {
    return NextResponse.json({ error: "Missing public key" }, { status: 500 });
  }

  const publicKey = JSON.parse(publicKeyJson);

  const jwks = { keys: [publicKey] };

  return NextResponse.json(jwks, { status: 200 });
}
