import express from "express";
import debug from "debug";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const log: debug.IDebugger = debug("app:auth-controller");

/**
 * This value is automatically populated from .env, a file which you will have
 * to create for yourself at the root of the project.
 *
 * See .env.example in the repo for the required format.
 */
// @ts-expect-error
const jwtSecret: string = process.env.JWT_SECRET;
const tokenExpirationInSeconds = 36000;

class AuthController {
  async createJWT(req: express.Request, res: express.Response) {
    try {
      const refreshId = req.body.userId + jwtSecret;
      const salt = crypto.createSecretKey(crypto.randomBytes(16));
      const hash = crypto
        .createHmac("sha512", salt)
        .update(refreshId)
        .digest("base64");
      req.body.refreshKey = salt.export();
      const token = jwt.sign(req.body, jwtSecret, {
        expiresIn: tokenExpirationInSeconds,
      });
      return res.status(201).send({
        accessToken: token,
        refreshToken: hash,
        expiresIn: tokenExpirationInSeconds,
        user_id: req.body.userId,
      });
    } catch (err) {
      log("createJWT error: %O", err);
      return res.status(500).send();
    }
  }
}

export default new AuthController();
