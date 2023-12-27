import { sign, decode } from "jsonwebtoken";
import { Types } from "mongoose";

import { ExtractJwt } from "passport-jwt";
import { getSeconds } from "./time";

export const JWTConfig = {
  TTL: process.env.JWT_ACCESS_TOKEN_EXP_DATE || 12 * 30 * 24 * 60 * 60 * 1000, // 15min
  TTL2: getSeconds(process.env.JWT_REFRESH_TOKEN_EXP_DATE), // 7days
  Options: {
    audience: "example.com",
    issuer: "api.example.com",
    secretOrKey: process.env.JWT_SECRET || "123",
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  },
} as const;


const JWTService = {
  signAccessToken: (subject: string, payload: object) => {
    const { issuer, audience, secretOrKey } = JWTConfig.Options;

    return new Promise<string>((resolve, reject) => {
      sign(
        payload,
        secretOrKey,
        {
          issuer: issuer,
          audience: audience,
          subject: String(subject),
          expiresIn: JWTConfig.TTL,
        },
        (error, token) => {
          if (error) {
            return reject(error);
          }

          resolve(token || "");
        }
      );
    });
  },

  signRefreshToken: (subject: string, payload: object) => {
    const { issuer, audience, secretOrKey } = JWTConfig.Options;

    return new Promise<string>((resolve, reject) => {
      sign(
        payload,
        secretOrKey,
        {
          issuer: issuer,
          audience: audience,
          subject: String(subject),
          expiresIn: JWTConfig.TTL2,
        },
        (error, token) => {
          if (error) {
            return reject(error);
          }

          resolve(token || "");
        }
      );
    });
  },
};

export default JWTService;
