"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";

/*
  Lightweight Dialog wrapper based on shadcn.ui + Radix primitives.
  Exports: Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose
*/

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = ({ children }: { children: React.ReactNode }) => (
  <DialogPrimitive.Portal>{children}</DialogPrimitive.Portal>
);

const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={
      // use a lighter overlay so the dialog feels minimal; rely on site palette
      "fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]" +
      (className ? ` ${className}` : "")
    }
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <div
      ref={ref}
      role="dialog"
      style={{
        backgroundColor: "var(--popover)",
        color: "var(--popover-foreground)",
        borderColor: "var(--border)",
      }}
      className={
        // minimal card: use site popover/card vars, subtle border and ring
        "fixed top-1/2 left-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border p-4 shadow-sm" +
        (className ? ` ${className}` : "")
      }
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="hover:bg-secondary/5 absolute top-3 right-3 inline-flex items-center justify-center rounded p-1">
        <X className="text-deep h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </div>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

function DialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mb-4 ${className ?? ""}`}>{children}</div>;
}

function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-lg font-semibold ${className ?? ""}`}>{children}</h2>
  );
}

function DialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-sm text-slate-600 ${className ?? ""}`}>{children}</p>
  );
}

function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-6 flex justify-end gap-2 ${className ?? ""}`}>
      {children}
    </div>
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogPrimitive,
};

export default Dialog;
