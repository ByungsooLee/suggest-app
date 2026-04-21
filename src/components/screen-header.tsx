type ScreenHeaderProps = {
  title: string;
  description: string;
};

export function ScreenHeader({ title, description }: ScreenHeaderProps) {
  return (
    <header className="space-y-2">
      <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
    </header>
  );
}
