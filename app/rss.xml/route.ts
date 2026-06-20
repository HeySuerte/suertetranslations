// Alias for /feed.xml — some aggregators (Novel Updates included) probe
// /rss.xml by convention. Same response, same caching.
// Note: route segment config must be declared directly in this file —
// Next.js reads it via static analysis and does not follow re-exports.
export { GET } from "../feed.xml/route";
export const dynamic = "force-dynamic";
