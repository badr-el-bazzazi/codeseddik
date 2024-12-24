import { ResultContext } from "@/components/ResultProvider";
import { createFileRoute } from "@tanstack/react-router";
import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
// import { Card, CardHeader, CardTitle } from "@/components/ui/card";
// import { Link } from "@tanstack/react-router";
import Database from "@tauri-apps/plugin-sql";
import { ArrowLeft } from "lucide-react";


function ResultIndex() {

  const context = useContext(ResultContext);
  if (!context) {
    throw new Error("useContext must be used within ResultContextProvider");
  }
  const { resultContext, setResultContext } = context;
  const navigate = useNavigate();

  // const [total, setTotal] = useState(0);

  const [questionId, setQuestionId] = useState(0);

  // const [serieName, setSerieName] = useState("");
  const [serieResultImage, setSerieResultImage] = useState();
  const getMediaURL = (mediaData: string | Uint8Array, type: string) => {
    if (!mediaData) return "";

    try {
      let uint8Array: Uint8Array;

      // Check if it's a base64-encoded image
      if (typeof mediaData === "string" && mediaData.startsWith("data:image")) {
        // If it's a base64-encoded string, no need for parsing, just handle it as a Blob
        return mediaData; // Directly return the base64 string as the src for the image
      }

      // Check if mediaData is a string and parse it (for non-image types)
      if (typeof mediaData === "string") {
        // Parse the string representation of the array
        const parsedMediaData = JSON.parse(mediaData);

        // Ensure it's an array-like structure of numbers
        if (
          !Array.isArray(parsedMediaData) ||
          !parsedMediaData.every((item) => typeof item === "number")
        ) {
          throw new Error("Invalid media data format");
        }

        // Convert the parsed array to Uint8Array
        uint8Array = new Uint8Array(parsedMediaData);
      } else {
        // If it's already a Uint8Array, use it directly
        uint8Array = mediaData;
      }

      // Determine MIME type based on the type parameter
      let mimeType: string;
      if (type === "audio") {
        mimeType = "audio/mpeg";
      } else if (type === "video") {
        mimeType = "video/mp4"; // Adjust for video
      } else if (type === "image") {
        mimeType = "image/jpeg"; // Adjust for images based on your data format
      } else {
        throw new Error("Unsupported media type");
      }

      // Create a blob and return the URL
      const blob = new Blob([uint8Array], { type: mimeType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error processing media data:", error);
      return "";
    }
  };

  interface resultType {
    questionId: number;
    correct: boolean;
  }

  // get result if true or false to color the cards
  useEffect(() => {
    let count = 0;
    resultContext?.forEach((item: resultType) => {
      if (item.correct === true) {
        count++;
      }
      setQuestionId(item.questionId);
    });
    // setTotal(count);

    return () => {
      // setTotal(0);
    };
  }, [resultContext]);



  // get the serie name
  const getSerieName = async () => {
    try {
      const db = await Database.load("sqlite:roadcode.db");
      const name = await db.select(
        "SELECT S.description,S.serie_result FROM series S JOIN QUESTIONS Q ON S.serie_id = Q.serie_id WHERE Q.question_id = $1 ;",
        [questionId],
      );

      if (Array.isArray(name) && name.length > 0) {
        // console.log(name);
        // setSerieName(name[0].description);
        setSerieResultImage(name[0].serie_result);
        return name;
      } else {
        throw new Error("No name found with the given ID");
      }
    } catch (error) {
      console.error("somthing went wrong ", error);
    }
  };
  useEffect(() => {
    const fetchSerieName = async () => {
      await getSerieName();
    };

    fetchSerieName();
    // getSerieName();
  }, [questionId]);

  return (
    <div className="container mx-auto h-screen w-screen">
      <div className="w-full" style={{ height: "90%" }}>
        {
          serieResultImage && (
            <img
              className="w-full h-full object-contain inset-0"
              src={getMediaURL(
                serieResultImage,
                "image",
              )}
            />
          )
        }
      </div>
      <div className="bg-green-700 flex justify-center items-center gap-8  w-full" style={{ height: "10%" }}>
        <div>
          <Button
            onClick={() => {
              setResultContext([]);
              navigate({ to: "/" });
            }}
            className="w-28 flex justify-center items-center"
          >
            <ArrowLeft className="w-12" />

            <div className="w-24">
              خروج
            </div>
          </Button>
        </div>
        <div>
          <Button
            onClick={() => {
              navigate({ to: "/series/results/resultdetails" });
            }}
            className="w-28 flex justify-center items-center"
          >
            <ArrowLeft className="w-12" />

            <div className="w-24">
              تفاصيل الاجوبة
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
export const Route = createFileRoute("/series/results/")({
  component: ResultIndex,
});
