export interface Env {
  // KV namespace binding placeholder — provision in Wave 2.
  // MARKETS_KV: KVNamespace;
}

export default {
  async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return new Response("hello from archimera-edge\n", {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    return new Response("not found\n", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
} satisfies ExportedHandler<Env>;
