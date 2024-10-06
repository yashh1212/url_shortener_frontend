import React, { useState } from "react";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import {Card,CardContent,CardHeader,CardTitle,CardDescription,} from "./components/Card";
import { Alert } from "./components/Alert";
import { Loader2, Link as LinkIcon, Copy, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast"; 
export default function URLShortener() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [clicks, setClicks] = useState(null);

  const handleShorten = async () => {
    setIsLoading(true);
    setError("");
    setShortUrl("");

    try {
      const response = await fetch(
        "https://url-shortener-backend-ashen.vercel.app/api/shorten",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ longUrl }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to shorten URL");
      }

      const data = await response.json();
      setShortUrl(data.shortUrl);
      setClicks(null); 
    } catch (err) {
      setError("Failed to shorten URL. Please try again.",err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shortUrl)
      .then(() => {
        setCopied(true);
        toast.success("URL copied to clipboard!"); 
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast.error("Failed to copy URL.");  
      });
  };

  const fetchClicks = async () => {
    const code = shortUrl.split("/").pop();  
    try {
      const response = await fetch(
        `https://url-shortener-backend-ashen.vercel.app/api/url/${code}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch clicks");
      }
      const data = await response.json();
      if (data && data.clicks !== undefined) {
        setClicks(data.clicks);  
      }
    } catch (err) {
      console.error("Failed to fetch clicks:", err);
    }
  };

  const handleRedirect = () => {
    if (shortUrl) {
      window.open(shortUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <Toaster position="top-center" reverseOrder={false} />

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            URL Shortener
          </CardTitle>
          <CardDescription className="text-center">
            Enter a long URL to get a shortened version
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex space-x-2">
              <Input
                type="url"
                placeholder="Enter long URL"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleShorten} disabled={isLoading || !longUrl}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LinkIcon className="mr-2 h-4 w-4" />
                )}
                Shorten
              </Button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert>{error}</Alert>
                </motion.div>
              )}

              {shortUrl && (
                <motion.div
                  className="flex items-center space-x-2 bg-muted p-2 rounded"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Input
                    type="url"
                    value={shortUrl}
                    readOnly
                    className="flex-grow"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    as="a"
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={fetchClicks}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {clicks !== null && (
              <div className="text-center mt-4">
                <p>Clicks: {clicks}</p>
              </div>
            )}

            {shortUrl && (
              <motion.div
                className="mt-4 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button onClick={handleRedirect} className="w-full">
                  Go to Shortened URL
                </Button>
              </motion.div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
