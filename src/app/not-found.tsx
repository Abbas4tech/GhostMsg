"use client";

import { Home, SearchX } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br px-4">
      <Card className="w-full max-w-md rounded-sm shadow-lg">
        <CardHeader className="gap-4">
          <div className="flex justify-center">
            <div className="flex items-center justify-center rounded-full bg-red-200 p-4">
              <SearchX className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-center font-bold text-2xl md:text-3xl">
            404
          </CardTitle>
          <CardDescription className="text-center font-semibold text-lg capitalize md:text-xl">
            page not found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            You are trying to access page that doesn&#39;t exist.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild className="gap-2" variant="default">
              <Link href={"/"}>
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
