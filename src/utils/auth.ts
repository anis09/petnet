import { sign } from "jsonwebtoken";
import { vars } from "./../constants/vars";

const generateAccessToken = (userId: string): string => {
  return sign({ uid: userId }, vars.jwtSecretKey, {
    expiresIn: vars.jwtExpiresIn,
  });
};
const generateRefreshToken = (userId: string): string => {
  return sign({ uid: userId }, vars.jwtRefreshKey, {
    expiresIn: vars.jwtRefreshKey,
  });
};

export { generateAccessToken, generateRefreshToken };
