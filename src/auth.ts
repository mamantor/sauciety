// src/auth.ts
import { SvelteKitAuth } from "@auth/sveltekit";
import { env } from '$env/dynamic/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
    callbacks: {
        async signIn() {
            return true;
        },

        async jwt({ token, profile }) {
            if (profile) {
                token.name = profile.nickname ?? profile.preferred_username ?? token.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.name = token.name;
                // session.user.email = token.email;
            }
            return session;
        }
    },
    providers: [
        {
            id: "authentik",
            name: "authentik",
            type: "oidc",
            clientId: env.OIDC_CLIENT_ID!,
            clientSecret: env.OIDC_CLIENT_SECRET!,
            issuer: env.OIDC_CLIENT_ISSUER!,
        }
    ],
    useSecureCookies: false,
    trustHost: true
});