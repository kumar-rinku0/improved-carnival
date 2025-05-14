import crypto from "crypto";
import fs from "fs";

function generateAdminToken(length = 32): void {
  const token = crypto.randomBytes(length).toString("hex");
  fs.writeFileSync("adminToken.txt", token, "utf-8");
  console.log("Admin token generated and saved to adminToken.txt");
}

generateAdminToken();
