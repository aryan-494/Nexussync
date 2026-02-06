import express from "express";
import { contextMiddleware } from "./context";
import { HttpError } from "./errors";

export function createApp() {
  const app = express();
  app.use(express.json());
  // Attach request context early
  app.use(contextMiddleware);

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      requestId: req.context?.requestId,
    });
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

