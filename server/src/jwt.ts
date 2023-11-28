import jwt from "jsonwebtoken"

export interface Payload {
  id: number;
  email: string;
  name: string;
  surname: string;
}

export function generateAccessToken(payload: Payload, hashedPassword: string) {
  return jwt.sign(payload, process.env.SECRET + "." + hashedPassword);
}

export function verifyJwtToken(token: string, hashedPassword: string) {
  try {
    if (jwt.verify(token, process.env.SECRET + "." + hashedPassword)) {
      return true;
    }
  } catch (err) {
    return false;
  }
  
  return false;
}
