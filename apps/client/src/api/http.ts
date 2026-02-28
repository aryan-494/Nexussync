// what this file really do?
// it transport layer for http request, it will handle the base url and the token
// always send cookie and parse json, and throw clean error

const BASE_URL = import.meta.env.VITE_API_URL as string;


export type AppError = {
  code: string;
  message: string;
  status: number;
};

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {

    const response = await fetch(`${BASE_URL}${path}` , {
        ...options,
        credentials:"include" , // always send cokkies 
        headers:{
            "Content-Type":"application/json",
            ...(options.headers || {}),
        },

    });

    let data: any = null;

    try{
        data= await response.json();
    }
    catch{
        data = null;
    }
   

    if (!response.ok){
        const error : AppError = {
            code: data?.error?.code || "UNKNOWN_ERROR",
            message : data?.error?.message || "somthing went wrong",
            status: response.status,
            
        };

        throw error;
    }

    return data as T;

}


export const http = {
    get:<T>(path:string)=>
        request<T>(path,{
            method:"GET",
        }),
    
    post:<T>(path:string, body?:unknown)=> request<T>(path , {
        method:"POST",
        body: body ? JSON.stringify(body):undefined,

    }),
    patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
}

