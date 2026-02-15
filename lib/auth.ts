import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";


export const authOptions:
NextAuthOptions = {
    session: {strategy: "jwt"},

    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email"},
                password: { label: "Password", type: "password"}, 
            },
            async authorize(credentials){
                const email = credentials?.email?.toLowerCase().trim();
                const password = credentials?.password;

                if(!email || !password) return null;

                const user = await prisma.user.findUnique({ where: {email}});
                if(!user) return null;

                const ok = await bcrypt.compare(passwordm user.password);
                if(!ok) return null

                return {
                    id: user.id,
                    name: user.name, 
                    email: user.email, 
                    role: user.role, 

                } as any;

            },
        }),
    ],

    callbacks: {
        async jwt({ token, user}){
            if(user){
                token.id = user.id;
                token.role = (user as any).role;
            }

            return token;
        },

        async session({session, token}){
            if(session.user){
                session.user.id = token.id as string;
                session.user.role = token.role as "ADMIN" | "USER"; 
            }

            return session;
        },
    },

    pages: { signIn: "/login"},
};