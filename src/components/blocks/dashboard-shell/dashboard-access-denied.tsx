"use client";

import type React from "react";
import { Button } from "@/components/elements/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/elements/card";

export interface DashboardAccessDeniedProps {
  onGoToLogin: () => void;
}

/** Shown when an unauthenticated visitor reaches the dashboard. */
export function DashboardAccessDenied({
  onGoToLogin,
}: DashboardAccessDeniedProps): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="mx-4 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Access Denied</CardTitle>
          <CardDescription className="text-center">
            Please log in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={onGoToLogin}>Go to Login</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardAccessDenied;
