
import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { loadConfig } from "../config";
import { ACCESS_TOKEN_COOKIE
 } from "../modules/auth/auth.types";

 type Next = (err?: any) => void;


// to convert cookie as a string to an object 

 function parseCookies(cookieHeader?: string){

    const cookies:Record<string, string> = {};
    if (!cookieHeader) return cookies;

    cookieHeader.split(";").forEach((cookie)=>{
        const[key, ...rest]=cookie.trim().split("=");
        cookies[key]=decodeURIComponent(rest.join("="));
    });
    return cookies;


 }

export function socketAuthMiddleware(socket: Socket, next: Next){

   try{
     const config = loadConfig();
     const cookieHeader = socket.handshake.headers.cookie;
     console.log("cookies:", cookieHeader);


     const cookies = parseCookies(cookieHeader);
     const token = cookies[ACCESS_TOKEN_COOKIE];


     if (!token) {
  console.log("[socket] no token");
  return next(new Error("Unauthorized"));
}

const payload = jwt.verify(token, config.auth.jwtSecret)as jwt.JwtPayload;

(socket as any).user = {
  id: payload.sub as string,
  email: payload.email as string,
};


console.log("[socket] authenticated:", payload.sub);

next();
   }
   catch(err){
    console.log("[socket] auth failed");
    return next(new Error("Unauthorized"))

   }


}