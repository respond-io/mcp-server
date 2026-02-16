import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Request, Response, NextFunction } from "express";

// Mock the constants module before importing tokenVerifier
jest.mock("../src/constants.js", () => ({
  API_CONFIG: {
    API_KEY: undefined, // Will be modified in tests
  },
}));

import { tokenVerifier } from "../src/middlewares/TokenVerifier.js";

const createJwt = (payload: Record<string, unknown>) => {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.sig`;
};

const validPayload = {
  iat: 1770951311,
  id: 22035,
  spaceId: 106312,
  type: "api",
  orgId: 80,
};

const createReq = (overrides?: Partial<Request>): Request =>
  ({
    headers: {},
    query: {},
    ...overrides,
  }) as Request;

const createRes = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res) as unknown as Response["status"];
  res.json = jest.fn().mockReturnValue(res) as unknown as Response["json"];
  return res;
};

// Import the mocked API_CONFIG
import { API_CONFIG } from "../src/constants.js";

describe("Token Verifier with API Key Authentication", () => {
  const originalApiKey = API_CONFIG.API_KEY;

  afterEach(() => {
    // Reset API_KEY after each test
    (API_CONFIG as any).API_KEY = originalApiKey;
  });

  it("uses RESPONDIO_API_KEY as authorization token when set", () => {
    const validToken = createJwt(validPayload);
    (API_CONFIG as any).API_KEY = validToken;

    const req = createReq();
    const res = createRes();
    const next = jest.fn() as NextFunction;

    tokenVerifier(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(validPayload);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("adds Bearer prefix to API key if not present", () => {
    const tokenWithoutBearer = createJwt(validPayload);
    (API_CONFIG as any).API_KEY = tokenWithoutBearer;

    const req = createReq();
    const res = createRes();
    const next = jest.fn() as NextFunction;

    tokenVerifier(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(validPayload);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("uses API key with Bearer prefix when already present", () => {
    const tokenWithBearer = `Bearer ${createJwt(validPayload)}`;
    (API_CONFIG as any).API_KEY = tokenWithBearer;

    const req = createReq();
    const res = createRes();
    const next = jest.fn() as NextFunction;

    tokenVerifier(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(validPayload);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("falls back to normal header validation when RESPONDIO_API_KEY is not set", () => {
    (API_CONFIG as any).API_KEY = undefined;

    const req = createReq();
    const res = createRes();
    const next = jest.fn() as NextFunction;

    tokenVerifier(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "No authorization header provided",
    });
  });
});

describe("tokenVerifier", () => {
  beforeEach(() => {
    // Ensure API_KEY is not set for these tests
    (API_CONFIG as any).API_KEY = undefined;
  });

  it("accepts a valid Authorization header", () => {
    const token = createJwt(validPayload);
    const req = createReq({
      headers: { authorization: `Bearer ${token}` } as Request["headers"],
    });
    const res = createRes();
    const next = jest.fn() as NextFunction;

    tokenVerifier(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(validPayload);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 401 when authorization header is not provided", () => {
    (API_CONFIG as any).API_KEY = undefined;

    const req = createReq();
    const res = createRes();
    const next = jest.fn() as NextFunction;

    tokenVerifier(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "No authorization header provided",
    });
  });
});
