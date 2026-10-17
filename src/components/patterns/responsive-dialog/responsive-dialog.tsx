"use client";

import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/elements/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/elements/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

export interface ResponsiveDialogProps {
  children: React.ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

/**
 * Dialog on >=768px, bottom Drawer below it (ADR: handoff rule 7). Swaps the
 * whole Radix primitive, not just the chrome, so each stays fully accessible
 * (Dialog focus trap vs Drawer's swipe-to-dismiss sheet).
 */
function ResponsiveDialog({
  open,
  onOpenChange,
  children,
}: ResponsiveDialogProps): React.JSX.Element {
  const isMobile = useIsMobile();
  const Root = isMobile ? Drawer : Dialog;

  return (
    <Root onOpenChange={onOpenChange} open={open}>
      {children}
    </Root>
  );
}

export interface ResponsiveDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

function ResponsiveDialogContent({
  children,
  className,
}: ResponsiveDialogContentProps): React.JSX.Element {
  const isMobile = useIsMobile();
  const Content = isMobile ? DrawerContent : DialogContent;

  return <Content className={className}>{children}</Content>;
}

export interface ResponsiveDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function ResponsiveDialogHeader({
  children,
  className,
}: ResponsiveDialogHeaderProps): React.JSX.Element {
  const isMobile = useIsMobile();
  const Header = isMobile ? DrawerHeader : DialogHeader;

  return <Header className={className}>{children}</Header>;
}

export interface ResponsiveDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

function ResponsiveDialogTitle({
  children,
  className,
}: ResponsiveDialogTitleProps): React.JSX.Element {
  const isMobile = useIsMobile();
  const Title = isMobile ? DrawerTitle : DialogTitle;

  return <Title className={className ?? "text-h2"}>{children}</Title>;
}

export interface ResponsiveDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

function ResponsiveDialogDescription({
  children,
  className,
}: ResponsiveDialogDescriptionProps): React.JSX.Element {
  const isMobile = useIsMobile();
  const Description = isMobile ? DrawerDescription : DialogDescription;

  return <Description className={className}>{children}</Description>;
}

export interface ResponsiveDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

function ResponsiveDialogFooter({
  children,
  className,
}: ResponsiveDialogFooterProps): React.JSX.Element {
  const isMobile = useIsMobile();
  const Footer = isMobile ? DrawerFooter : DialogFooter;

  return <Footer className={className}>{children}</Footer>;
}

export {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
};
