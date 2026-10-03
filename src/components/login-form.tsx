"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    const { error } = await authClient.signIn.email(values);
    if (error) {
      toast.error("Não foi possível entrar. Confira e-mail e senha.");
      return;
    }
    const callback = new URLSearchParams(window.location.search).get("callbackUrl");
    const destino =
      callback &&
      callback.startsWith("/") &&
      !callback.startsWith("//") &&
      !callback.startsWith("/\\")
        ? callback
        : "/painel";
    router.push(destino);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="font-normal text-muted-foreground">
          E-mail
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="voce@empresa.com"
          autoComplete="email"
          className="h-12 rounded-full border-border px-5 text-base md:text-sm"
          aria-invalid={Boolean(errors.email) || undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        {errors.email ? (
          <p id="email-error" className="text-xs text-destructive" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className="font-normal text-muted-foreground">
          Senha
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Sua senha"
            autoComplete="current-password"
            className="h-12 rounded-full border-border px-5 pr-11 text-base md:text-sm"
            aria-invalid={Boolean(errors.password) || undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1 right-1.5 text-muted-foreground"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
          >
            <span className="relative grid size-3.5 place-items-center">
              <motion.span
                aria-hidden
                className="col-start-1 row-start-1"
                animate={{
                  opacity: showPassword ? 0 : 1,
                  scale: showPassword ? 0.25 : 1,
                  filter: showPassword ? "blur(4px)" : "blur(0px)",
                }}
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              >
                <EyeIcon className="size-3.5" />
              </motion.span>
              <motion.span
                aria-hidden
                className="col-start-1 row-start-1 absolute"
                animate={{
                  opacity: showPassword ? 1 : 0,
                  scale: showPassword ? 1 : 0.25,
                  filter: showPassword ? "blur(0px)" : "blur(4px)",
                }}
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              >
                <EyeOffIcon className="size-3.5" />
              </motion.span>
            </span>
          </Button>
        </div>
        {errors.password ? (
          <p id="password-error" className="text-xs text-destructive" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 h-12 w-full rounded-full text-base"
      >
        {isSubmitting ? <LoaderCircleIcon aria-hidden className="animate-spin" /> : null}
        {isSubmitting ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
