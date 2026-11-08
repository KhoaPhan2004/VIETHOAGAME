type SectionProps = {
  title: string;
  titleClassName?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export default function Section({
  title,
  titleClassName,
  action,
  children,
}: SectionProps) {
  return (
    <section className="content-section">
      {action ? <div className="content-section-heading"><h2 className={titleClassName}>{title}</h2>{action}</div> : <h2 className={titleClassName}>{title}</h2>}

      <div className="content-section-body">
        {children}
      </div>
    </section>
  );
}
