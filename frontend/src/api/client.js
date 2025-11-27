import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000
});

export async function runSimulation(payload, mode = "batch") {
  const resp = await api.post(`/simulation/run?mode=${mode}`, payload);
  return resp.data;
}

export async function getMetadata() {
  const resp = await api.get("/meta/variables");
  return resp.data;
}

export async function healthCheck() {
  const resp = await api.get("/meta/health");
  return resp.data;
}
