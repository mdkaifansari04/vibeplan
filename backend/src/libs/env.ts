import dotenv from "dotenv";
dotenv.config();

export interface EnvConfig {
  NODE_ENV?: string;
  PORT?: string;
  DATABASE_URL?: string;
}

const rawEnv = process.env as EnvConfig & Record<string, string | undefined>;
function toEnvKey(key: PropertyKey): string {
  if (typeof key !== "string") return String(key);
  if (/^[A-Z0-9_]+$/.test(key)) return key;

  const withUnderscores = key.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/-/g, "_");
  return withUnderscores.toUpperCase();
}

const config = new Proxy(rawEnv, {
  get(target, prop: string) {
    const envKey = toEnvKey(prop);
    return target[envKey];
  },
  ownKeys() {
    return Reflect.ownKeys(process.env);
  },
  getOwnPropertyDescriptor(target, prop) {
    const envKey = toEnvKey(prop as string);
    if (envKey in process.env) {
      return {
        configurable: true,
        enumerable: true,
        value: process.env[envKey],
        writable: false,
      };
    }
    return undefined;
  },
});

function getString(key: string, fallback?: string): string | undefined {
  const v = config[key as keyof typeof config] as unknown as string | undefined;
  return v ?? fallback;
}

function getNumber(key: string, fallback?: number): number | undefined {
  const v = getString(key);
  if (v == null) return fallback;
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
}

function getBool(key: string, fallback?: boolean): boolean | undefined {
  const v = getString(key);
  if (v == null) return fallback;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

const configWithHelpers = Object.assign(config, {
  getString,
  getNumber,
  getBool,
});

export default configWithHelpers;
export { getString, getNumber, getBool };
