import { useState } from "react";
import DOMPurify from "dompurify";
import { Monitor, Smartphone } from "lucide-react";

function PreviewTabs({ form }: { form: any }) {
  const [view, setView] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="flex flex-col h-[80vh] w-full">
      {/* Tabs */}
      <div className="flex gap-2 px-6 pt-4 pb-3 border-b flex-shrink-0">
        <button
          onClick={() => setView("desktop")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-out ${
            view === "desktop"
              ? "bg-primary border border-btn-border shadow-md scale-105"
              : "bg-muted border hover:bg-muted hover:scale-102"
          }`}
        >
          <Monitor size={16} className="transition-transform duration-300" />
          Desktop
        </button>

        <button
          onClick={() => setView("mobile")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-out ${
            view === "mobile"
              ? "bg-primary border border-btn-border text-primary-foreground shadow-md scale-105"
              : "bg-muted border hover:bg-muted hover:scale-102"
          }`}
        >
          <Smartphone size={16} className="transition-transform duration-300" />
          Mobile
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 no-scrollbar  bg-gradient-to-br from-muted/30 via-muted/20 to-muted/30 p-4 md:p-8 overflow-auto">
        <div className="flex justify-center items-start h-full w-full">
          
          {/* Desktop View */}
          <div
            className={`w-full max-w-3xl no-scrollbar transition-all duration-500 ease-in-out ${
              view === "desktop"
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 absolute pointer-events-none"
            }`}
          >
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              
              {/* Browser Top Bar */}
              <div className="bg-zinc-200 dark:bg-zinc-700 px-4 py-3 flex items-center gap-2 border-b border-zinc-300 dark:border-zinc-600">
                <div className="flex gap-2 flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer" />
                </div>
                <div className="flex-1 ml-4 min-w-0">
                  <div className="bg-white dark:bg-zinc-800 rounded-md px-3 py-1 text-xs text-muted-foreground border truncate">
                    📧 Email Preview
                  </div>
                </div>
              </div>

              {/* Email Container */}
              <div className="bg-white no-scrollbar  dark:bg-zinc-900 p-4 md:p-8 overflow-auto max-h-[600px]">
                <div className="max-w-[600px] mx-auto">

                  {/* Email Body */}
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none [&_*]:max-w-full [&_img]:max-w-full [&_img]:h-auto [&_table]:w-full [&_table]:table-auto"
                    style={{
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(form.body),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div
            className={`flex justify-center no-scrollbar  items-start transition-all duration-500 ease-in-out ${
              view === "mobile"
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 absolute pointer-events-none"
            }`}
          >
            {/* Phone Frame */}
            <div className="relative w-[320px] sm:w-[375px] h-[600px] sm:h-[667px] flex-shrink-0">
              
              {/* Phone Body */}
              <div className="absolute inset-0 bg-black rounded-[40px] sm:rounded-[50px] shadow-2xl p-2 sm:p-3">
                
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-6 sm:h-9 bg-black rounded-b-2xl z-20 flex items-end justify-center pb-2">
                  <div className="w-12 sm:w-16 h-1 sm:h-1.5 bg-zinc-800 rounded-md" />
                </div>

                {/* Screen */}
                <div className="relative w-full no-scrollbar  h-full bg-white dark:bg-zinc-950 rounded-[32px] sm:rounded-[42px] overflow-hidden shadow-inner">
                  
                  {/* Status Bar */}
                  <div className="absolute top-0 left-0 right-0 h-10 sm:h-11 bg-white dark:bg-zinc-950 px-6 sm:px-8 flex items-center justify-between text-[10px] sm:text-xs font-semibold z-10">
                    <div>9:41</div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                      <div className="text-[9px] sm:text-[10px]">100%</div>
                    </div>
                  </div>

                  {/* Email App Header */}
                  <div className="absolute top-10 sm:top-11 left-0 right-0 bg-white dark:bg-zinc-950 border-b px-3 sm:px-4 py-2 sm:py-3 z-10">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                        S
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-semibold truncate">sender@example.com</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground truncate">To: recipient@example.com</div>
                      </div>
                    </div>
                    <h2 className="text-sm sm:text-base font-bold mt-2 sm:mt-3 line-clamp-2">{form.subject || "Email Subject"}</h2>
                  </div>

                  {/* Email Content - Scrollable */}
                  <div className="absolute no-scrollbar  top-[130px] sm:top-[152px] bottom-0 left-0 right-0 overflow-y-auto bg-white dark:bg-zinc-950">
                    <div className="p-3 sm:p-4">
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-[13px] leading-relaxed [&_*]:max-w-full [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_table]:w-full [&_table]:table-auto [&_table]:text-[10px] sm:[&_table]:text-xs [&_p]:mb-2 sm:[&_p]:mb-3 [&_h1]:text-base sm:[&_h1]:text-lg [&_h2]:text-sm sm:[&_h2]:text-base [&_h3]:text-xs sm:[&_h3]:text-sm [&_a]:break-all"
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          width: "100%"
                        }}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(form.body),
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-1.5 sm:bottom-1 left-1/2 -translate-x-1/2 mb-4 w-24 sm:w-30 h-1.5 bg-black/50 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewTabs;