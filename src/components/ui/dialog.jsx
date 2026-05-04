import * as React from "react";

const DialogContext = React.createContext({});

function Dialog({ open, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = (val) => {
    if (!isControlled) setInternalOpen(val);
    onOpenChange?.(val);
  };

  return (
    <DialogContext.Provider value={{ isOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ children, asChild }) {
  const { setOpen } = React.useContext(DialogContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick: () => setOpen(true) });
  }
  return <span onClick={() => setOpen(true)}>{children}</span>;
}

function DialogPortal({ children }) {
  return children;
}

function DialogOverlay({ className = "", ...props }) {
  return (
    <div
      className={["fixed inset-0 z-50 bg-black/80", className].join(" ")}
      {...props}
    />
  );
}

function DialogContent({ className = "", children, ...props }) {
  const { isOpen, setOpen } = React.useContext(DialogContext);
  if (!isOpen) return null;
  return (
    <>
      <DialogOverlay onClick={() => setOpen(false)} />
      <div
        className={[
          "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full max-w-lg rounded-xl border bg-background p-6 shadow-lg",
          className,
        ].join(" ")}
        {...props}
      >
        {children}
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </>
  );
}

function DialogHeader({ className = "", ...props }) {
  return (
    <div
      className={["flex flex-col space-y-1.5 text-center sm:text-left", className].join(" ")}
      {...props}
    />
  );
}

function DialogFooter({ className = "", ...props }) {
  return (
    <div
      className={["flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className].join(" ")}
      {...props}
    />
  );
}

function DialogTitle({ className = "", ...props }) {
  return (
    <h2
      className={["text-lg font-semibold leading-none tracking-tight", className].join(" ")}
      {...props}
    />
  );
}

function DialogDescription({ className = "", ...props }) {
  return (
    <p className={["text-sm text-muted-foreground", className].join(" ")} {...props} />
  );
}

function DialogClose({ children, asChild }) {
  const { setOpen } = React.useContext(DialogContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick: () => setOpen(false) });
  }
  return <span onClick={() => setOpen(false)}>{children}</span>;
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
