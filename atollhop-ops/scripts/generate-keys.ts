import fs from "fs";

import { generateKeyPair, exportJWK } from "jose";

async function generateAndExportKeys() {
  const { publicKey, privateKey } = await generateKeyPair("RS256", {
    extractable: true,
  });

  const privateJwk = await exportJWK(privateKey);
  const publicJwk = await exportJWK(publicKey);

  privateJwk.use = "sig";
  privateJwk.kid = "my-key-id";
  privateJwk.alg = "RS256";

  publicJwk.use = "sig";
  publicJwk.kid = "my-key-id";
  publicJwk.alg = "RS256";

  fs.writeFileSync("privateKey.jwk.json", JSON.stringify(privateJwk, null, 2));
  fs.writeFileSync("publicKey.jwk.json", JSON.stringify(publicJwk, null, 2));

  console.log("Keys generated and saved to files.");
}

generateAndExportKeys();
