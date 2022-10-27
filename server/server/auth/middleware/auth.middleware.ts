import express from "express";
import usersService from "../../users/services/users.service";
import bcrypt from "bcryptjs";

class AuthMiddleware {
  async verifyUserPassword(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user: any = await usersService.getByKey(req.body.email, "email");
    if (user) {
      const passwordHash = user.password;
      if (await bcrypt.compare(req.body.password, passwordHash)) {
        req.body = {
          userId: user._id,
          email: user.email,
          permissionFlags: user.permissionFlags,
        };
        return next();
      }
    }
    res.status(400).send({ errors: ["Invalid email and/or password"] });
  }
}

export default new AuthMiddleware();
