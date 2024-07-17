"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FelicityProvider, TutorialStep, useFelicity } from "felicity-react";
import { ArrowUp, MessageCircleIcon } from "lucide-react";
import React, { useCallback, useState } from "react";

const FelicityChat: React.FC = () => {
  const felicity = useFelicity();
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<TutorialStep[]>();
  const [isLoading, setLoading] = useState(false);

  const onSearch = useCallback(async () => {
    setLoading(true);

    const response = await felicity.search(input);

    setLoading(false);

    if (response.success) {
      setSteps(response.steps);
    }
  }, [felicity, input]);

  return (
    <div className="container max-w-none min-h-screen flex h-screen w-full flex-col items-center gap-6 pt-12 pr-6 pl-6">
      {/* Header */}
      <div className="flex-none flex w-full max-w-[750px] items-center gap-4 ">
        <div className="flex grow shrink-0 basis-0 items-center gap-2">
          <MessageCircleIcon />
          <span className="text-lg font-semibold">ACME Chat</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex justify-center overflow-y-auto min-h-0  w-full">
        <div className="w-full max-w-[750px] flex flex-col gap-6">
          {steps &&
            steps.map((step, index) => (
              <>
                <div key={step.id} className="flex flex-col text-sm">
                  <div className="font-semibold mb-1">Step {index + 1}</div>
                  <div className="mb-3">{step.action}</div>
                  <div className="w-full h-[500px] border rounded bg-neutral-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={step.screenshot}
                      alt={step.action}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <Separator />
              </>
            ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none flex w-full max-w-[750px] flex-col items-start gap-8">
        <div className="flex w-full flex-col items-start gap-2 pb-4">
          <div
            className="flex w-full items-center gap-2 overflow-hidden rounded-full bg-input pt-3 pr-4 pb-3 pl-4"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch();
              }
            }}
          >
            <Input
              className="bg-input border-none ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Search ACME company for questions."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />

            <Button
              size="icon"
              className="rounded-full flex-none"
              disabled={isLoading}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FelicityChatExample: React.FC = () => {
  return (
    <FelicityProvider
      config={{
        // Provide in environment variable.
        apiKey: "your-api-key-here",
      }}
    >
      <FelicityChat />
    </FelicityProvider>
  );
};
