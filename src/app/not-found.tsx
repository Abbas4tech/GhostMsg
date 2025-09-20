"use client";

import React from "react";
import { Home, SearchX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound(): React.JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br">
      <Card className="w-full rounded-sm max-w-md shadow-lg">
        <CardHeader className="gap-4">
          <div className="flex justify-center">
            <div className="rounded-full flex justify-center items-center bg-red-200 p-4">
              <SearchX className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl md:text-3xl font-bold">
            404
          </CardTitle>
          <CardDescription className="capitalize text-center text-lg md:text-xl font-semibold">
            page not found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            You are trying to access page that doesn&#39;t exist.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild variant="default" className="gap-2">
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
