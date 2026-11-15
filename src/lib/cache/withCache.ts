import { NextFunction, Response, Request } from "express";
import { cacheProvider } from "./init.js";

export function withCache(ttl = 3600) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.method}:${req.originalUrl}`;
    const cached = await cacheProvider.get(key);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.json(JSON.parse(cached));
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        res.setHeader("X-Cache", "MISS");
        cacheProvider.set(key, JSON.stringify(body), ttl);
      }
      return originalJson(body);
    };
    next();
  };
}
