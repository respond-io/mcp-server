import { describe, it, expect, jest } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
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

describe("tokenVerifier", () => {
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

  it("accepts token from query parameter without Bearer prefix", () => {
    const token = createJwt(validPayload);
    const req = createReq({
      query: { token } as Request["query"],
    });
    const res = createRes();
    const next = jest.fn() as NextFunction;

    tokenVerifier(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(validPayload);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("accepts authorization from query parameter with Bearer prefix", () => {
    const token = createJwt(validPayload);
    const req = createReq({
      query: { authorization: `Bearer ${token}` } as Request["query"],
    });
    const res = createRes();
    const next = jest.fn() as NextFunction;

    tokenVerifier(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(validPayload);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 401 when neither header nor query token is provided", () => {
    const req = createReq();
    const res = createRes();
    const next = jest.fn() as NextFunction;

    tokenVerifier(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "No authorization header or token query parameter provided",
    });
  });

  it("returns 401 for invalid query token format", () => {
    const req = createReq({
      query: { token: "invalid" } as Request["query"],
    });
    const res = createRes();
    const next = jest.fn() as NextFunction;

    tokenVerifier(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid JWT format" });
  });
});
