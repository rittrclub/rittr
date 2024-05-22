/**  (c) Santosh Sahoo */

export async function $postJson<T = any>(
  url: string,
  data?: Record<string, unknown>,
  method = "get",
  controller?: any
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    method,
    body: data ? JSON.stringify(data) : undefined,
    signal: controller ? controller.signal : undefined,
    redirect: "error",
  });
  if (res.status === 403) throw new Error("auth_failure");
  // if (!res.ok) throw Error(res.statusText);
  return (await res.json()) as T;
  // .finally(Topbar.hide);
}

async function callApi<T>(
  url: string,
  method: string | symbol,
  params: unknown
) {
  const { result, error } = await $postJson<{ error; result: T }>(url, {
    params,
    method,
  });
  //@ts-ignore
  if (error)
    //@ts-ignore
    throw new Error(error?.message || "Server error");
  return result;
}

export function JSONRpc(
  url: string,
  namespaces: string[] = []
): Record<string, any> {
  return new Proxy(
    {},
    {
      get(_, entity) {
        if (namespaces.includes(entity as string)) {
          return new Proxy(
            {},
            {
              get(_, prop) {
                return <T>(body: unknown) =>
                  callApi<T>(url, [entity, prop].join("."), body);
              },
            }
          );
        }
        return <T>(body: unknown) => callApi<T>(url, entity, body);
      },
    }
  );
}
