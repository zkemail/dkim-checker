import * as crypto from 'crypto';
import * as forge from 'node-forge';

export function getModulusHexFromBase64(base64PublicKey: string): string {
  // Decode Base64 to get binary data
  const binaryData = Buffer.from(base64PublicKey, 'base64');

  // Create RSA public key
  let rsaPublicKey;
  try {
    rsaPublicKey = crypto.createPublicKey({
      key: binaryData,
      format: 'der',
      type: 'spki'
    });

    const pemPublicKey = rsaPublicKey.export({ format: 'pem', type: 'spki' }).toString();

    // Convert from PEM
    const derPublicKey = forge.pki.publicKeyFromPem(pemPublicKey);

    // Get modulus and convert to hexadecimal
    const modulusHex = derPublicKey.n.toString(16);

    return `0x${modulusHex}`;
  } catch (error) {
    console.error('Error creating RSA public key:', error);
    return '';
  }
}

// Example usage
// const base64PublicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAntvSKT1hkqhKe0xcaZ0x+QbouDsJuBfby/S82jxsoC/SodmfmVs2D1KAH3mi1AqdMdU12h2VfETeOJkgGYq5ljd996AJ7ud2SyOLQmlhaNHH7Lx+Mdab8/zDN1SdxPARDgcM7AsRECHwQ15R20FaKUABGu4NTbR2fDKnYwiq5jQyBkLWP+LgGOgfUF4T4HZb2PY2bQtEP6QeqOtcW4rrsH24L7XhD+HSZb1hsitrE0VPbhJzxDwI4JF815XMnSVjZgYUXP8CxI1Y0FONlqtQYgsorZ9apoW1KPQe8brSSlRsi9sXB/tu56LmG7tEDNmrZ5XUwQYUUADBOu7t1niwXwIDAQAB';
// console.log('Modulus in Hex:', getModulusHexFromBase64(base64PublicKey));
