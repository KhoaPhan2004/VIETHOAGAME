type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
};

export default function Button({
  children,
  type = "button",
  variant = "primary",
}: ButtonProps) {
  return (
    <button type={type} className={`button button-${variant}`}>
      {children}
    </button>
  );
}
