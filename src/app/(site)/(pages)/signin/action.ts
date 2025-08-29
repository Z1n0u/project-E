"use server";
import { validatedAction } from "@/server/lib/action-helpers";
import { auth } from "@/server/lib/auth";
import { LoginSchema } from "@/types/auth";
import { redirect } from "next/navigation";

export const loginEmail = validatedAction(LoginSchema, async (data) => {
  const { email, password } = data;

  await auth.api.signInEmail({
    body: { email, password },
  });

  redirect("/");
});
