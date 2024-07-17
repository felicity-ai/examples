Example Felicity AI templates that use the [felicity-react](https://www.npmjs.com/package/felicity-react) npm package.

These examples are built using [ShadCN](https://ui.shadcn.com/) and [Next.js](https://nextjs.org/).

## Example Usage

You can find examples under the `src/components/examples` folder.

Here is a very simple example

```tsx
const UsageComponent = () => {
  // Uses the nearest Felicity provider.
  const felicity = useFelicity();
  const [value, setValue] = useState("");

  return (
    <div>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button
        onClick={async () => {
          // Issue query to felicity.
          const results = await felicity.search(value);
        }}
      >
        Search
      </Button>
    </div>
  );
};

export const SimpleApp = () => {
  return (
    // Provide your felicity instance with your API key.
    <FelicityProvider
      config={{
        // Provide in environment variable.
        apiKey: "your-api-key-here",
      }}
    >
      <UsageComponent />
    </FelicityProvider>
  );
};
```
