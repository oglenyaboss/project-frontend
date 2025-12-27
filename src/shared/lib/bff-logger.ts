/**
 * BFF Debug Logger
 * Красивое логирование запросов к бэкенду для отладки
 */

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // Foreground
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

const METHOD_COLORS: Record<string, string> = {
  GET: COLORS.green,
  POST: COLORS.cyan,
  PUT: COLORS.yellow,
  PATCH: COLORS.magenta,
  DELETE: COLORS.red,
};

const STATUS_COLORS: Record<string, string> = {
  "2": COLORS.green, // 2xx
  "3": COLORS.blue, // 3xx
  "4": COLORS.yellow, // 4xx
  "5": COLORS.red, // 5xx
};

function getTimestamp(): string {
  return new Date().toISOString().slice(11, 23);
}

function formatMethod(method: string): string {
  const color = METHOD_COLORS[method] || COLORS.white;
  return `${color}${COLORS.bright}${method.padEnd(6)}${COLORS.reset}`;
}

function formatStatus(status: number): string {
  const colorKey = String(status)[0];
  const color = STATUS_COLORS[colorKey] || COLORS.white;
  return `${color}${COLORS.bright}${status}${COLORS.reset}`;
}

function formatDuration(ms: number): string {
  if (ms < 100) return `${COLORS.green}${ms}ms${COLORS.reset}`;
  if (ms < 500) return `${COLORS.yellow}${ms}ms${COLORS.reset}`;
  return `${COLORS.red}${ms}ms${COLORS.reset}`;
}

function truncate(str: string, maxLength: number = 500): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "... (truncated)";
}

function formatBody(body: unknown): string {
  if (!body) return "";

  try {
    if (typeof body === "string") {
      // Try to parse as JSON for pretty printing
      try {
        const parsed = JSON.parse(body);
        return truncate(JSON.stringify(parsed, null, 2));
      } catch {
        return truncate(body);
      }
    }

    if (body instanceof FormData) {
      const entries: string[] = [];
      body.forEach((value, key) => {
        if (value instanceof File) {
          entries.push(`  ${key}: [File: ${value.name}, ${value.size} bytes]`);
        } else {
          entries.push(`  ${key}: ${truncate(String(value), 100)}`);
        }
      });
      return `FormData {\n${entries.join("\n")}\n}`;
    }

    return truncate(JSON.stringify(body, null, 2));
  } catch {
    return "[Unable to format body]";
  }
}

export interface BffLogOptions {
  /** Route name for identification, e.g. 'projects' or 'agent/sessions' */
  route: string;
  /** Whether to log request body */
  logBody?: boolean;
  /** Whether to log response body */
  logResponse?: boolean;
}

/**
 * Log an outgoing request to the backend
 */
export function logRequest(
  method: string,
  url: string,
  options: BffLogOptions,
  body?: unknown,
): void {
  const timestamp = getTimestamp();
  const prefix = `${COLORS.gray}[${timestamp}]${COLORS.reset} ${COLORS.blue}[BFF:${options.route}]${COLORS.reset}`;

  console.log(
    `${prefix} ${COLORS.bright}→${COLORS.reset} ${formatMethod(method)} ${COLORS.dim}${url}${COLORS.reset}`,
  );

  if (options.logBody !== false && body) {
    console.log(`${COLORS.gray}   Request Body:${COLORS.reset}`);
    console.log(`${COLORS.dim}${formatBody(body)}${COLORS.reset}`);
  }
}

/**
 * Log a response from the backend
 */
export function logResponse(
  method: string,
  url: string,
  status: number,
  durationMs: number,
  options: BffLogOptions,
  responseBody?: string,
): void {
  const timestamp = getTimestamp();
  const prefix = `${COLORS.gray}[${timestamp}]${COLORS.reset} ${COLORS.blue}[BFF:${options.route}]${COLORS.reset}`;

  console.log(
    `${prefix} ${COLORS.bright}←${COLORS.reset} ${formatMethod(method)} ${formatStatus(status)} ${formatDuration(durationMs)} ${COLORS.dim}${url}${COLORS.reset}`,
  );

  if (options.logResponse !== false && responseBody) {
    console.log(`${COLORS.gray}   Response Body:${COLORS.reset}`);
    console.log(`${COLORS.dim}${formatBody(responseBody)}${COLORS.reset}`);
  }
}

/**
 * Log an error during BFF processing
 */
export function logError(route: string, error: unknown): void {
  const timestamp = getTimestamp();
  const prefix = `${COLORS.gray}[${timestamp}]${COLORS.reset} ${COLORS.red}[BFF:${route}]${COLORS.reset}`;

  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(
    `${prefix} ${COLORS.red}${COLORS.bright}✖ ERROR:${COLORS.reset} ${errorMessage}`,
  );

  if (error instanceof Error && error.stack) {
    console.error(`${COLORS.dim}${error.stack}${COLORS.reset}`);
  }
}

/**
 * Create a wrapper for fetch that automatically logs requests/responses
 */
export function createLoggedFetch(options: BffLogOptions) {
  return async function loggedFetch(
    url: string,
    init?: RequestInit & { body?: BodyInit | null },
  ): Promise<Response> {
    const method = init?.method || "GET";
    const startTime = Date.now();

    // Log request
    logRequest(method, url, options, init?.body);

    try {
      const response = await fetch(url, init);
      const durationMs = Date.now() - startTime;

      // Clone response to read body without consuming it
      const clonedResponse = response.clone();
      let responseBody: string | undefined;

      try {
        responseBody = await clonedResponse.text();
      } catch {
        responseBody = "[Could not read response body]";
      }

      // Log response
      logResponse(
        method,
        url,
        response.status,
        durationMs,
        options,
        responseBody,
      );

      return response;
    } catch (error) {
      logError(options.route, error);
      throw error;
    }
  };
}

/**
 * Convenience: Log a complete request-response cycle
 */
export function logBffCycle(
  route: string,
  method: string,
  url: string,
  status: number,
  durationMs: number,
  requestBody?: unknown,
  responseBody?: string,
): void {
  const options: BffLogOptions = { route, logBody: true, logResponse: true };
  logRequest(method, url, options, requestBody);
  logResponse(method, url, status, durationMs, options, responseBody);
}
