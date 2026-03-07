const BASE_URL = import.meta.env.VITE_API_URL as string;

export type AppError = {
  code: string
  message: string
  status: number
}

async function request<T>(
  path: string,
  options: RequestInit
): Promise<T> {

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  })

  if (!res.ok) {

    let data

    try {
      data = await res.json()
    } catch {
      throw {
        code: "UNKNOWN_ERROR",
        message: "Unknown server error",
        status: res.status
      } satisfies AppError
    }

    throw {
      code: data?.error?.code ?? "UNKNOWN_ERROR",
      message: data?.error?.message ?? "Request failed",
      status: res.status
    } satisfies AppError
  }

  return res.json()
}

export const http = {

  get: <T>(path: string) =>
    request<T>(path, {
      method: "GET",
    }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
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