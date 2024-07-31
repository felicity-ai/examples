"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  FelicityProvider,
  TutorialStep,
  useFelicity,
  useFelicitySearchQuery,
} from "felicity-react";
import {
  ArrowUp,
  BotIcon,
  MessageCircleIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

/**
 * The various states that your results section can be in.
 */
type ResultState =
  | {
      // Landing screen.
      type: "initial";
    }
  | {
      // Issued query, but no steps returned.
      type: "empty-results";
      text: string;
      triageType: "data" | "usage" | "unparseable" | "internals";
    }
  | {
      // There weas an error.
      type: "error";
      reason: string;
    }
  | {
      type: "loading";
      text: string;
    }
  | {
      type: "show-results";
      steps: TutorialStep[];
      answerFeedbackId?: string;
    };

const LoadingSpinner: React.FC = () => {
  return (
    <svg
      className="animate-spin h-5 w-5 text-black"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

const NullState: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => {
  return (
    <div className="flex flex-col h-full justify-center text-sm text-center">
      <div>{title}</div>
      <div>{subtitle}</div>
    </div>
  );
};

const SuggestedQuestionGridCard: React.FC<{
  question: string;
  onClick: () => void;
}> = ({ question, onClick }) => {
  return (
    <div
      className="border rounded p-3 shadow-sm flex flex-col gap-2 text-sm cursor-pointer hover:bg-neutral-100"
      onClick={onClick}
    >
      <MessageCircleIcon size={16} className="text-neutral-400" />
      <div>{question}</div>
    </div>
  );
};

const SuggestedQuestionGrid: React.FC<{
  onSearch: (query: string) => void;
}> = ({ onSearch }) => {
  const exampleQuestions = [
    "How do I create a new timecard?",
    "How do I view an Activity",
    "What is the best way for me to edit a timecard?",
  ];
  return (
    <div className="w-full gap-3 grid grid-cols-3">
      {exampleQuestions.map((exampleQuestion) => (
        <SuggestedQuestionGridCard
          key={exampleQuestion}
          question={exampleQuestion}
          onClick={() => onSearch(exampleQuestion)}
        />
      ))}
    </div>
  );
};

const TutorialStepCard: React.FC<{
  step: TutorialStep;
  index: number;
}> = ({ step, index }) => {
  return (
    <div className="flex flex-col w-full flex-wrap text-sm text-wrap">
      <div className="font-semibold mb-1">Step {index}</div>
      <div className="mb-3 ">{step.action}</div>
      <div className="w-full h-[500px] border rounded bg-neutral-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={step.screenshot}
          alt={step.action}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

const FeedbackRow: React.FC<{
  answerFeedbackId: string;
}> = ({ answerFeedbackId }) => {
  const felicity = useFelicity();
  const [step, setStep] = useState<"correct" | "feedback" | "done">("correct");
  const [feedbackInput, setFeedbackInput] = useState("");

  switch (step) {
    case "correct":
      return (
        <div className="flex items-center justify-between text-sm w-full">
          <div>Was that answer helpful?</div>
          <div className="flex gap-2 text-neutral-500">
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => {
                felicity.sendFeedback(answerFeedbackId, {
                  isCorrect: true,
                });
                setStep("feedback");
              }}
            >
              <ThumbsUpIcon size={16} />
            </Button>
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => {
                felicity.sendFeedback(answerFeedbackId, {
                  isCorrect: false,
                });
                setStep("feedback");
              }}
            >
              <ThumbsDownIcon size={16} />
            </Button>
          </div>
        </div>
      );

    case "feedback":
      return (
        <div className="flex flex-col text-sm w-full gap-3">
          <div>Thanks for your feedback! Any additional comments?</div>
          <Textarea
            value={feedbackInput}
            onChange={(e) => setFeedbackInput(e.target.value)}
            placeholder="Additional thoughts?"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => {
                felicity.sendFeedback(answerFeedbackId, {
                  comment: feedbackInput,
                });
                setStep("done");
              }}
            >
              Submit
            </Button>
            <Button onClick={() => setStep("done")} variant={"secondary"}>
              Cancel
            </Button>
          </div>
        </div>
      );

    case "done":
      return (
        <div className="flex flex-col text-sm w-full gap-3">
          <div>Thanks for your feedback!</div>
        </div>
      );
  }
};

const ChatLoading: React.FC<{
  text: string;
}> = ({ text }) => {
  return (
    <div className="flex h-full flex-col gap-3 items-center justify-center">
      <LoadingSpinner />
      <div className="text-sm">{text}...</div>
    </div>
  );
};

const FelicityResultBody: React.FC<{
  state: ResultState;
  onQuery: (input: string) => void;
}> = ({ state, onQuery }) => {
  switch (state.type) {
    case "initial":
      return (
        <div className="flex flex-col gap-6 h-full justify-center w-full max-w-[750px] items-center">
          <div>
            {/* Your Icon or Assistant message here. */}
            <BotIcon size={48} />
          </div>

          {/* Some prompt */}
          <SuggestedQuestionGrid onSearch={onQuery} />
        </div>
      );

    case "show-results":
      const { steps, answerFeedbackId } = state;
      return (
        <div className="w-full max-w-[750px] flex flex-col gap-6">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <TutorialStepCard index={index + 1} step={step} />
              <Separator />
            </React.Fragment>
          ))}

          {answerFeedbackId && (
            <FeedbackRow
              key={answerFeedbackId}
              answerFeedbackId={answerFeedbackId}
            />
          )}
        </div>
      );

    case "empty-results":
      return (
        <NullState
          key={state.triageType}
          title={state.text}
          subtitle="Please contact your representative."
        />
      );

    case "error":
      return (
        <NullState
          title="Somethin went wrong."
          subtitle="Please contact your representative."
        />
      );

    case "loading":
      return <ChatLoading text={state.text} />;
  }
};

const FelicityChat: React.FC = () => {
  const { search, status, error, loadingStep, data } = useFelicitySearchQuery();
  const [input, setInput] = useState("");

  const onSearch = useCallback(
    async (query?: string) => {
      if (query) {
        setInput(query);
      }

      search(query ? query : input, {
        userId: "example-id",
        additionalData: {
          fooData: "abc",
        },
      });
    },
    [input, search]
  );

  const resultState: ResultState = useMemo(() => {
    if (status === "idle") {
      return {
        type: "initial",
      };
    }

    if (status === "pending" && loadingStep) {
      return {
        type: "loading",
        text: loadingStep,
      };
    }

    if (status === "success" && data) {
      if (data.triageType === "usage") {
        if (data.goalSatisfied) {
          return {
            type: "show-results",
            steps: data.steps,
            answerFeedbackId: data.answerFeedbackId,
          };
        } else {
          return {
            type: "empty-results",
            text: "This task is impossible in our app.",
            triageType: "usage",
          };
        }
      } else {
        return {
          type: "empty-results",
          text: `This was a ${data.triageType} query.`,
          triageType: data.triageType,
        };
      }
    }

    if (status === "error" && error) {
      return {
        type: "error",
        reason: error,
      };
    }

    return {
      type: "error",
      reason: "Something went wrong",
    };
  }, [error, loadingStep, data, status]);

  return (
    <div className="container max-w-none min-h-screen flex h-screen w-full flex-col items-center gap-6 pt-12 px-6">
      {/* Header */}
      <div className="flex-none flex w-full max-w-[750px] items-center gap-4 ">
        <div className="flex grow shrink-0 basis-0 items-center gap-2">
          <MessageCircleIcon />
          <span className="text-lg font-semibold">ACME Chat</span>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 flex justify-center overflow-y-auto min-h-0 w-full">
        {resultState && (
          <FelicityResultBody
            state={resultState}
            onQuery={(input) => {
              onSearch(input);
            }}
          />
        )}
      </div>

      {/* Search */}
      <div className="flex-none w-full max-w-[750px] pb-4">
        <div
          className="flex w-full items-center gap-2 overflow-hidden rounded-full bg-input p-4"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch();
            }
          }}
        >
          <Input
            className={cn(
              "bg-input border-none ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
            )}
            placeholder="Search ACME company for questions."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status === "pending"}
          />

          <Button
            size="icon"
            className="rounded-full flex-none"
            disabled={status === "pending"}
            onClick={() => onSearch()}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
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
