type ScreenHeaderProps = {
  title: string;
  description: string;
};

export function ScreenHeader({ title, description }: ScreenHeaderProps) {
  return (
    <header className="space-y-2">
      <p className="text-heading">Movie Tonight</p>
      <h1 className="text-movie-title">{title}</h1>
      <p className="text-body">{description}</p>
    </header>
  );
}
