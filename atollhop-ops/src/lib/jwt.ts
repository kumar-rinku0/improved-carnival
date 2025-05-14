import { SignJWT, importJWK, JWTPayload } from "jose";

interface CustomClaims extends JWTPayload {
  operator_id: string;
}

export async function signOperatorJWT(operatorId: string): Promise<string> {
  const privateKeyJwk = JSON.parse(process.env.PRIVATE_KEY_JWK!);
  const privateKey = await importJWK(privateKeyJwk, "RS256");

  const token = await new SignJWT({
    operator_id: operatorId,
  } as CustomClaims)
    .setProtectedHeader({ alg: "RS256", kid: "my-key-id" })
    .setSubject(operatorId)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  return token;
}
