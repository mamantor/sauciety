import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.auth();

  console.log({
    url: event.url.href,
    proto: event.request.headers.get("x-forwarded-proto"),
    host: event.request.headers.get("x-forwarded-host"),
    origin: event.request.headers.get("origin")
  });

  console.log('SESSION LAYOUT:', session);

  return {
    session
  };
};