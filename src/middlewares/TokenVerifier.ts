import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { JWTPayload } from "../types.js";

// Define the validation schema for the JWT payload
const jwtPayloadSchema = z.object({
  iat: z.number(),
  id: z.number(),
  spaceId: z.number(),
  type: z.string(),
  orgId: z.number(),
});

// Extend the Express Request interface to include the decoded user payload
declare module "express-serve-static-core" {
  interface Request {
    user?: JWTPayload;
  }
}

const TOKEN_QUERY_KEYS = ["token", "auth_token", "authToken", "authorization"] as const;

const toStringValue = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  if (Array.isArray(value)) {
    const first = value.find((entry) => typeof entry === "string" && entry.length > 0);
    return typeof first === "string" ? first : undefined;
  }
  return undefined;
};

const getAuthHeaderFromQuery = (req: Request): string | undefined => {
  for (const key of TOKEN_QUERY_KEYS) {
    const value = toStringValue(req.query[key]);
    if (!value) {
      continue;
    }
    if (value.startsWith("Bearer ")) {
      return value;
    }
    return `Bearer ${value}`;
  }
  return undefined;
};

/**
 * Middleware to verify the authenticity of a JSON Web Token (JWT).
 * This middleware checks for the presence of a Bearer token in the `Authorization` header,
 * and if missing, falls back to an auth token passed as a query parameter.
 * validates its format, and ensures the payload contains all the required fields.
 * If the token is valid, the decoded payload is attached to the `req.user` property.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the chain.
 */
export const tokenVerifier = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization ?? getAuthHeaderFromQuery(req);

    if (!authHeader) {
      res.status(401).json({ error: "No authorization header or token query parameter provided" });
      return;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res
        .status(401)
        .json({ error: "Invalid authorization header format. Expected: Bearer <token>" });
      return;
    }

    const token = parts[1];
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      res.status(401).json({ error: "Invalid JWT format" });
      return;
    }

    const payload = JSON.parse(
      Buffer.from(tokenParts[1], "base64url").toString("utf-8")
    ) as JWTPayload;

    // Validate the payload against the schema
    const validationResult = jwtPayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      res.status(401).json({
        error: "Invalid token payload",
        details: validationResult.error.flatten(),
      });
      return;
    }

    req.user = validationResult.data;
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        error: "Invalid token",
        details: error.message,
      });
    } else {
      res.status(401).json({
        error: "Invalid token",
        details: "Unknown error",
      });
    }
  }
};
