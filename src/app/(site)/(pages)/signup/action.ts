"use server";
import { validatedAction } from "@/server/lib/action-helpers";
import { auth } from "@/server/lib/auth";
import { SignUpSchema } from "@/types/auth";
import { redirect } from "next/navigation";

export const signUpEmail = validatedAction(SignUpSchema, async (data) => {
  const { name, lastname, phone, email, password } = data;

  try {
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        lastname,
        phone,
      },
    });

    if (!result) {
      console.log(result);
      return { error: result } as any;
    }
    redirect("/");
  } catch (error: any) {
    // Handle thrown errors (network, unexpected, etc.)
    return { error: error?.message || "An unexpected error occurred" };
  }
});
