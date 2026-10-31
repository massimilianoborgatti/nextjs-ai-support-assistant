export function createRateLimit(limit = 10, windowMs = 60_000) {
  const clients = new Map<string, { count: number; expires: number }>();
  return (client: string, now = Date.now()) => {
    for (const [key, value] of clients) if (value.expires <= now) clients.delete(key);
    const value = clients.get(client) ?? { count: 0, expires: now + windowMs };
    if (value.count >= limit) return false;
    // Bound memory even if a deployment supplies many different client identifiers.
    if (!clients.has(client) && clients.size >= 10000) return false;
    value.count++;
    clients.set(client, value);
    return true;
  };
}
