import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("./auth-form").then((m) => m.default));

const VerifyCodeForm = dynamic(() =>
  import("./verify-code-form").then((m) => m.default)
);

export { AuthForm, VerifyCodeForm };
