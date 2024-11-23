"use client";
import React, { useCallback ,useState } from 'react';
import * as ShadcnUI from "@/design-libraries/shadcn-ui";
import { useUpload } from "../utilities/runtime-helpers";

function MainComponent() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState("50");
  const { toast } = ShadcnUI.useToast();
  const [upload, { loading: uploadLoading }] = useUpload();
  const handleFileUpload = useCallback(
    async (file) => {
      setIsLoading(true);
      const { url, error } = await upload({ file });
      if (error) {
        toast({
          title: "Upload failed",
          description: error,
          variant: "destructive",
        });
        return;
      }
      setImageUrl(url);
      setIsLoading(false);
    },
    [upload]
  );
  const [showCaptionPage, setShowCaptionPage] = useState(false);
  const generateAnotherCaption = useCallback(async () => {
    if (!imageUrl) return;
    setIsGenerating(true);

    try {
      const imageResponse = await fetch(imageUrl);
      const blob = await imageResponse.blob();
      const reader = new FileReader();

      reader.onload = async () => {
        const base64Image = reader.result.split(",")[1];
        const visionResponse = await fetch("/integrations/gpt-vision/", {
          method: "POST",
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Generate a different creative, engaging, and trendy social media caption for this image. Make it unique from the previous caption, catchy and include relevant hashtags. The caption should be approximately ${wordCount} words long.`,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`,
                    },
                  },
                ],
              },
            ],
          }),
        });
        const visionResult = await visionResponse.json();
        const generatedCaption = visionResult.choices[0].message.content;
        const moderationResponse = await fetch(
          "/integrations/text-moderation/",
          {
            method: "POST",
            body: JSON.stringify({ input: generatedCaption }),
          }
        );
        const moderationResult = await moderationResponse.json();

        if (moderationResult.results[0].flagged) {
          toast({
            title: "Caption flagged",
            description:
              "Generated caption was flagged as inappropriate. Trying again...",
            variant: "destructive",
          });
          generateAnotherCaption();
          return;
        }

        setCaption(generatedCaption);
        setIsGenerating(false);
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate caption. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  }, [imageUrl, wordCount]);

  const generateCaption = useCallback(async () => {
    if (!imageUrl) return;

    setIsGenerating(true);

    try {
      const imageResponse = await fetch(imageUrl);
      const blob = await imageResponse.blob();
      const reader = new FileReader();

      reader.onload = async () => {
        const base64Image = reader.result.split(",")[1];
        const visionResponse = await fetch("/integrations/gpt-vision/", {
          method: "POST",
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Generate a creative, engaging, and trendy social media caption for this image. Make it catchy and include relevant hashtags. The caption should be approximately ${wordCount} words long.`,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`,
                    },
                  },
                ],
              },
            ],
          }),
        });
        const visionResult = await visionResponse.json();
        const generatedCaption = visionResult.choices[0].message.content;
        const moderationResponse = await fetch(
          "/integrations/text-moderation/",
          {
            method: "POST",
            body: JSON.stringify({ input: generatedCaption }),
          }
        );
        const moderationResult = await moderationResponse.json();

        if (moderationResult.results[0].flagged) {
          toast({
            title: "Caption flagged",
            description:
              "Generated caption was flagged as inappropriate. Trying again...",
            variant: "destructive",
          });
          generateCaption();
          return;
        }

        setCaption(generatedCaption);
        setIsGenerating(false);
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate caption. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  }, [imageUrl, wordCount]);

  if (!showCaptionPage) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div className="absolute inset-0">
          <img
            src="https://ucarecdn.com/3dff3dc2-9c41-437e-aabd-a5d8dde75d1a/-/format/auto/"
            alt="Beauty background with pink makeup and blue backdrop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs"></div>
        </div>
        <div className="text-center space-y-8 z-10">
          <img
            src="https://ucarecdn.com/c61a326c-8ded-4e9e-b85c-9e5952229d11/-/format/auto/"
            alt="Caption.AI Logo"
            className="w-48 mx-auto mb-4"
          />
          <p className="text-xl text-[#121212] max-w-md mx-auto">
            Transform your images into engaging social media captions with the
            power of AI
          </p>
          <ShadcnUI.Button
            size="lg"
            className="bg-[#4A90E2] text-white hover:bg-[#357ABD] transition-colors"
            onClick={() => setShowCaptionPage(true)}
          >
            Let's Generate Captions
            <i className="fas fa-arrow-right ml-2"></i>
          </ShadcnUI.Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative p-4 md:p-6">
      <div className="absolute inset-0 z-0">
        <img
          src="https://ucarecdn.com/3dff3dc2-9c41-437e-aabd-a5d8dde75d1a/-/format/auto/"
          alt="Beauty background with pink makeup and blue backdrop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xs"></div>
      </div>
      <ShadcnUI.Toaster />

      <div className="max-w-md mx-auto space-y-6 relative z-10">
        <div className="text-center">
          <img
            src="https://ucarecdn.com/c61a326c-8ded-4e9e-b85c-9e5952229d11/-/format/auto/"
            alt="Caption.AI Logo"
            className="w-32 mx-auto mb-4"
          />
          <p className="text-[#121212]">
            Upload an image to generate the perfect caption
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg p-4 space-y-4">
          <div className="relative">
            {!imageUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="space-y-2 text-center">
                  <i className="fas fa-cloud-upload-alt text-3xl text-gray-400"></i>
                  <p className="text-sm text-gray-500">
                    Click to upload or drag and drop
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && handleFileUpload(e.target.files[0])
                  }
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Uploaded preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                <ShadcnUI.Progress value={33} className="w-1/2" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <ShadcnUI.Select
              placeholder="Word count"
              value={wordCount}
              onValueChange={setWordCount}
              groups={[
                {
                  items: [
                    { value: "30", label: "Short (~30 words)" },
                    { value: "50", label: "Medium (~50 words)" },
                    { value: "100", label: "Long (~100 words)" },
                  ],
                },
              ]}
            />
            {!caption ? (
              <ShadcnUI.Button
                onClick={generateCaption}
                disabled={!imageUrl || isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-2"></i>
                    Generate Caption
                  </>
                )}
              </ShadcnUI.Button>
            ) : (
              <ShadcnUI.Button
                onClick={generateAnotherCaption}
                disabled={!imageUrl || isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync-alt mr-2"></i>
                    Generate Another
                  </>
                )}
              </ShadcnUI.Button>
            )}
          </div>

          {caption && (
            <div className="space-y-4">
              <div className="bg-[#4A90E2] bg-opacity-10 rounded-lg p-4">
                <p className="text-[#121212] whitespace-pre-wrap">{caption}</p>
              </div>
              <div className="flex justify-end">
                <ShadcnUI.Button
                  variant="outline"
                  size="sm"
                  className="text-[#4A90E2] border-[#4A90E2] hover:bg-[#4A90E2] hover:text-white transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(caption);
                    toast({
                      title: "Copied!",
                      description: "Caption copied to clipboard",
                    });
                  }}
                >
                  <i className="fas fa-copy mr-2"></i>
                  Copy
                </ShadcnUI.Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .min-h-screen {
          animation: fadeIn 1s ease-in forwards;
        }
      `}</style>
    </div>
  );
}

export default MainComponent;
