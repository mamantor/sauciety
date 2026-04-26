// src/auth.ts
import { SvelteKitAuth } from "@auth/sveltekit";
import { env } from '$env/dynamic/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log("SIGNIN CALLBACK", { user, account, profile });
            return true;
        },

        async jwt({ token, account, profile }) {
            console.log("JWT CALLBACK", { token, account, profile });
            return token;
        },
        async session({ session, token }) {
            console.log(`session ${JSON.stringify(session)}, token ${JSON.stringify(token)}`);
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