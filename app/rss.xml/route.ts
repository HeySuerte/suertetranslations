// Alias for /feed.xml — some aggregators (Novel Updates included) probe
// /rss.xml by convention. Same response, same caching.
// Note: revalidate must be declared directly in this file — Next.js reads
// route segment config via static analysis and does not follow re-exports.
export { GET } from "../feed.xml/route";
export const revalidate = 300;
