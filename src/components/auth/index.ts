import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("./AuthForm").then((m) => m.default));

const VerifyCodeForm = dynamic(() =>
  import("./VerifyCodeForm").then((m) => m.default)
);

export { AuthForm, VerifyCodeForm };
