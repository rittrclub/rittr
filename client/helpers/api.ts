import { JSONRpc } from "./JSONRpc";

export const $api = JSONRpc("/api/v1");
export const $my = JSONRpc("/api/v1/private");
