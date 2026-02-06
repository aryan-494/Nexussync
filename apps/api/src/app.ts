import express from "express";
import { contextMiddleware } from "./context";
import { requestLogger } from "./logger";
import { apiRouter } from "./routes";
import { HttpError } from "./errors";
import { NotFoundError } from "./errors";

export function createApp() {
  const app = express();
  app.use(express.json());
  // Attach request context early
  app.use(contextMiddleware);
  app.use(requestLogger);
  app.use("/api" , apiRouter());


  // Catch-all for unknown routes (404)
   app.use((req, _res, next) => {
     next(new NotFoundError(`Cannot ${req.method} ${req.path}`));
    });


  // Global error handler 
  app.use((err:unknown , req:express.Request, res:express.Response, _next:express.NextFunction)=>{
    const requestId = req.context?.requestId;

    if(err instanceof HttpError){
      return res.status(err.statusCode).json({
        error:err.message,
        requestId,
      });
    }

    // Unknown 
    console.error(err);

    return res.status(500).json({
      error:"Internal Server Error",
      requestId,
    });

  });

  return app;
}

