import Card from './Card';

// TEMPORARY: stands in for a screen that is not built yet. Delete it from a page once the
// real screen is built.
// screenId: the ID from CLAUDE.md section 7, e.g. "O3"
// title: the screen name
// description: one paragraph, what the finished screen will show
// todos: list of what still needs to be built
// headingLevel: 1 (default) | 2. Use 2 inside a layout that already has an h1 (the wizard).
function ScreenPlaceholder({ screenId, title, description, todos = [], headingLevel = 1 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h1';

  return (
    <Card>
      <p className="font-mono text-xs font-medium tracking-wide text-text-muted uppercase">
        {screenId} · Placeholder
      </p>
      <Heading className="mt-1 text-xl font-semibold text-text">{title}</Heading>
      <p className="mt-2 text-sm text-text-muted">{description}</p>

      {todos.length > 0 && (
        <>
          <p className="mt-4 text-sm font-semibold text-text">TODO</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-text">
            {todos.map((todo) => (
              <li key={todo}>{todo}</li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

export default ScreenPlaceholder;
