import crypto from 'crypto';
export function sha256Hex(input: string) {
    return crypto.createHash('sha256').update(input).digest('hex');
}
export function hmacHex(secret: string, input: string) {
    return crypto.createHmac('sha256', secret).update(input).digest('hex');
}
