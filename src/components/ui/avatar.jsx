import * as React from "react";

const Avatar = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={["relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className].join(" ")}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(({ className = "", src, alt = "", ...props }, ref) => {
  const [error, setError] = React.useState(false);
  if (error || !src) return null;
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={["aspect-square h-full w-full object-cover", className].join(" ")}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={[
      "flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium",
      className,
    ].join(" ")}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
