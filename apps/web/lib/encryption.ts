import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // bytes

export class EncryptionService {
  private key: Buffer;

  constructor(keyString: string) {
    if (!keyString) {
      throw new Error("ENCRYPTION_KEY is missing");
    }

    const key = Buffer.from(keyString, "hex");

    if (key.length !== KEY_LENGTH) {
      throw new Error(
        "ENCRYPTION_KEY must be a 32-byte hex string (64 characters)"
      );
    }

    this.key = key;
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(12); 
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
      iv.toString("hex"),
      authTag.toString("hex"),
      encrypted.toString("hex"),
    ].join(":");
  }

  decrypt(ciphertext: string): string {
    const parts = ciphertext.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted payload format");
    }

    const [ivHex, authTagHex, encryptedHex] = parts;

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  }
}

export function createEncryptionService(): EncryptionService {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error("ENCRYPTION_KEY env variable not set");
  }
  return new EncryptionService(encryptionKey);
}
