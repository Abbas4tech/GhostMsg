import Link from "next/link";
import type React from "react";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/elements/breadcrumb";
import { cn } from "@/lib/utils";

export interface PageHeadingCrumb {
  /** Omit on the current page. */
  href?: string;
  label: string;
}

export interface PageHeadingProps {
  /** Right-aligned actions (e.g. "View as visitor"). */
  actions?: React.ReactNode;
  breadcrumb: PageHeadingCrumb[];
  className?: string;
  description?: React.ReactNode;
  title: string;
}

/** Dashboard page heading: breadcrumb, h1, optional lead and actions. */
export function PageHeading({
  breadcrumb,
  title,
  description,
  actions,
  className,
}: PageHeadingProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-3.5",
        className
      )}
      data-slot="page-heading"
    >
      <div className="flex flex-col gap-1">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumb.map((crumb, index) => (
              <Fragment key={crumb.label}>
                {index > 0 ? (
                  <BreadcrumbSeparator>/</BreadcrumbSeparator>
                ) : null}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="font-bold text-[34px] leading-tight tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export default PageHeading;
