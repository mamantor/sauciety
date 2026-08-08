import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

// Shared by page loads/actions that should bounce an anonymous visitor back
// to the homepage. API endpoints that need a 401 instead (write-recipe's
// POST handler) check event.locals.auth() directly rather than using this.
export async function requireSession(event: RequestEvent) {
	const session = await event.locals.auth();

	if (!session?.user) {
		throw redirect(303, '/');
	}

	return session;
}
