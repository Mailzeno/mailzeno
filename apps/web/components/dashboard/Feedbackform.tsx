import { MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefObject } from "react";

export function FeedbackDropdown({
  feedbackOpen,
  setFeedbackOpen,
  feedback,
  setFeedback,
  feedbackInputRef,
}: {
  feedbackOpen: boolean;
  setFeedbackOpen: (v: boolean) => void;
  feedback: string;
  setFeedback: (v: string) => void;
  feedbackInputRef: RefObject<HTMLTextAreaElement>;
}) {
  return (
    <div className="relative">
      <div
        onClick={() => setFeedbackOpen(!feedbackOpen)}
        className="flex text-sm p-1 mt-0.5 cursor-pointer rounded-md items-center justify-center hover:bg-muted"
      >
        <MessageCircleQuestion className="h-5 w-5 text-foreground/90" />
      </div>

      {feedbackOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border bg-card shadow-lg">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium">Send us your feedback</p>
          </div>

          <div className="p-4 space-y-3">
            <textarea
              ref={feedbackInputRef}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you think..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              rows={4}
            />

            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setFeedbackOpen(false);
                  setFeedback("");
                }}
                className="px-3 py-1 text-sm bg-accent rounded-md border border-foreground/30 hover:bg-muted hover:shadow-md"
              >
                Cancel
              </Button>

              <Button
                variant="main"
                onClick={() => {
                  if (feedback.trim()) {
                    console.log("Feedback sent:", feedback);
                    setFeedback("");
                    setFeedbackOpen(false);
                  }
                }}
                className="px-3 py-1 text-sm rounded-md hover:shadow-md"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
