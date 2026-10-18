declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
  }
}
declare module "*.sql?raw" {
  const contents: string;
  export default contents;
}
