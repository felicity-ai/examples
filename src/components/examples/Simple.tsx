import { FelicityProvider, useFelicity } from "felicity-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const UsageComponent = () => {
  const felicity = useFelicity();
  const [value, setValue] = useState("");

  return (
    <div>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />ƒ
      <Button
        onClick={async () => {
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
