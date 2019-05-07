import jwt from 'jsonwebtoken';

const PRIVATE_KEY = process.env.JWT_SYMMETRIC;

export function createToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, PRIVATE_KEY, { expiresIn: '1d' }, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
}

export function extractToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, PRIVATE_KEY, (err, claims) => {
      if (err) {
        reject(err);
      } else {
        resolve(claims);
      }
    });
  });
}

export function getSid(cookie) {
  const re = /^JSESSIONID=(.*);/.exec(cookie);
  if (re) {
    return re[1];
  }
  return null;
}

export function createCookie(sid) {
  return `JSESSIONID=${sid};`;
}
