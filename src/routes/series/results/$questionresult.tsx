// import { useParams } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import Database from "@tauri-apps/plugin-sql";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Check,
  Pause,
  Play,
  RotateCcw,
  SquarePlay,
  Volume1,
  Volume2,
  X,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
interface Question {
  question_id: number;
  question_image: Uint8Array;
  question_audio: Uint8Array;
  question_answer: Uint8Array;
  question_video: Uint8Array;
  question_1: string;
  question_2: string;
  question_sug_1: string;
  question_sug_2: string;
  question_sug_3: string;
  question_sug_4: string;
  correct_answer_code: string;
  question_type: string;
  serie_id: number;
}
const QuestionResultDetails = () => {
  const { questionresult } = Route.useParams();

  const navigation = Route.useNavigate();

  const [answerVolume, setAnswerVolume] = useState(0.5);
  const [isAnswerPlaying, setIsAnswerPlaying] = useState(false);

  // const { resultContext, setResultContext } = useContext(ResultContext);

  const [questionne, setQuestion] = useState<Question>();

  const getQuestion = async (question_id: number) => {
    try {
      const db = await Database.load("sqlite:roadcode.db");
      const result = await db.select<Question[]>(
        "SELECT * FROM QUESTIONS WHERE question_id = $1;",
        [question_id],
      );

      if (Array.isArray(result) && result.length > 0) {
        // Since we're selecting by ID, we expect only one result
        const questionData = result[0];
        setQuestion(questionData);
        return questionData;
      } else {
        throw new Error("No question found with the given ID");
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      setQuestion(undefined);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getQuestion(parseInt(questionresult));
    };

    fetchData();

    // console.log(questionne);

    return () => {
    };
  }, []);


  const getMediaURL = (
    mediaData: string | Uint8Array | undefined,
    type: string,
  ) => {
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

  const getQuestionSuggestions = (question: Question | undefined) => {
    if (question) {
      return Object.entries(question)
        .filter(([key, value]) => key.startsWith("question_sug_") && value)
        .map(([_, value]) => value);
    }
  };
  const audioRefAnswer = useRef<HTMLAudioElement | any>();

  const suggestions = getQuestionSuggestions(questionne);

  const questionsStrusture = () => {
    const correctAnswers =
      questionne?.correct_answer_code?.toString()?.split("").map(Number) || [];
    const isCorrect = (index: number) => correctAnswers.includes(index + 1);

    if (questionne?.question_type === "1QMS") {
      if (
        questionne?.question_sug_3 !== "" ||
        questionne?.question_sug_4 !== ""
      ) {
        return (
          <div
            className="text-right flex flex-col justify-center items-center gap-4 h-full w-full font-bold "
            dir="rtl"
          >
            <p className="text-2xl text-center text-blue-700">
              {questionne?.question_1}
            </p>
            {suggestions?.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <p className="text-2xl text-center">{item}</p>
                {isCorrect(index)
                  ? <Check className="text-green-500 w-6 h-6" />
                  : <X className="text-red-500 w-6 h-6" />}
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <div
            className="text-right flex flex-col justify-center items-center gap-4 h-full font-bold"
            dir="rtl"
          >
            <p className="text-2xl text-blue-700">
              {questionne?.question_1}
            </p>
            <div className="flex justify-center items-center gap-24 w-full font-bold">
              {suggestions?.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <p className="text-2xl text-center">{item}</p>
                  {isCorrect(index)
                    ? <Check className="text-green-500 w-6 h-6" />
                    : <X className="text-red-500 w-6 h-6" />}
                </div>
              ))}
            </div>
          </div>
        );
      }
    } else {
      return (
        <div
          className="flex flex-col justify-center items-center gap-8 h-full text-center font-bold"
          dir="rtl"
        >
          <div className="flex flex-col justify-center items-center gap-4">
            <p className="text-2xl text-blue-700">
              {questionne?.question_1}
            </p>
            <div className="flex justify-center items-center gap-12">
              <div className="flex items-center gap-2">
                <p className="text-2xl">{questionne?.question_sug_1}</p>
                {isCorrect(0)
                  ? <Check className="text-green-500 w-6 h-6" />
                  : <X className="text-red-500 w-6 h-6" />}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl">{questionne?.question_sug_2}</p>
                {isCorrect(1)
                  ? <Check className="text-green-500 w-6 h-6" />
                  : <X className="text-red-500 w-6 h-6" />}
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center gap-4">
            <p className="text-2xl text-center text-blue-700">
              {questionne?.question_2}
            </p>
            <div className="flex justify-center items-center gap-12">
              <div className="flex items-center gap-2">
                <p className="text-2xl text-center">
                  {questionne?.question_sug_3}
                </p>
                {isCorrect(2)
                  ? <Check className="text-green-500 w-6 h-6" />
                  : <X className="text-red-500 w-6 h-6" />}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl text-center">
                  {questionne?.question_sug_4}
                </p>
                {isCorrect(3)
                  ? <Check className="text-green-500 w-6 h-6" />
                  : <X className="text-red-500 w-6 h-6" />}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const [hasVideo, setHasVideo] = useState<boolean>(false);

  useEffect(() => {
    setHasVideo(
      !!questionne?.question_video && questionne?.question_video.length > 0,
    );
  });

  return (
    <div className="container mx-auto h-screen w-screen ">
      <div className="w-full h-full grid grid-rows-2  overflow-hidden ">
        <div className="row-start-1 row-end-2  border-b flex justify-center items-center overflow-hidden relative h-full">
          {questionne?.question_image && (
            <img
              src={getMediaURL(questionne.question_image, "image")}
              alt="question image"
              className="w-full h-full object-contain absolute inset-0"
            />
          )}
        </div>
        <div className="row-start-2 row-end-3 flex flex-col">
          <div className="hidden">
            <audio
              controls
              ref={audioRefAnswer}
            >
              <source
                src={getMediaURL(
                  questionne?.question_answer,
                  "audio",
                )}
                type="audio/mpeg"
              />
            </audio>
          </div>

          <div className="" style={{ height: "100%" }}>
            {questionsStrusture()}
          </div>

          <div className="hidden">
            <audio
              controls
              ref={audioRefAnswer}
            >
              <source
                src={getMediaURL(
                  questionne?.question_answer,
                  "audio",
                )}
                type="audio/mpeg"
              />
            </audio>
          </div>
          <Card style={{ height: "11%" }}>
            <CardContent className="flex flex-row justify-center items-center gap-2 w-full">
              <div className="bg-white w-12 h-10 text-black rounded flex justify-center items-center">
                {Math.floor(answerVolume * 100)}%
              </div>
              <div>
                <Button
                  onClick={() => {
                    if (answerVolume > 0) {
                      const newVolume = Math.max(answerVolume - 0.1, 0); // Decrease volume by 0.1, min 0
                      setAnswerVolume(newVolume);
                      audioRefAnswer.current.volume = newVolume;
                    }
                  }}
                >
                  <Volume1 />
                </Button>
              </div>
              <div>
                <Button
                  onClick={() => {
                    if (audioRefAnswer.current.paused) {
                      audioRefAnswer.current.play();
                      setIsAnswerPlaying(true);
                    } else {
                      audioRefAnswer.current.pause();
                      setIsAnswerPlaying(false);
                    }
                  }}
                >
                  {isAnswerPlaying ? <Pause /> : <Play />}
                </Button>
              </div>

              <div>
                <Button
                  onClick={() => {
                    audioRefAnswer.current.currentTime = 0;
                    setIsAnswerPlaying(true);
                  }}
                >
                  <RotateCcw />
                </Button>
              </div>

              <div>
                <Button
                  onClick={() => {
                    if (answerVolume < 1) {
                      const newVolume = Math.min(answerVolume + 0.1, 1); // Increase volume by 0.1, max 1
                      setAnswerVolume(newVolume);
                      audioRefAnswer.current.volume = newVolume;
                    }
                  }}
                >
                  <Volume2 />
                </Button>
              </div>

              <div>
                <Button
                  onClick={() => {
                    navigation({ to: "/series/results" });
                  }}
                  className="flex justify-center items-cener"
                >
                  <ArrowLeft className="w-10" />
                  خروج
                </Button>
              </div>

              {hasVideo
                ? (
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button className="flex gap-4">
                        <SquarePlay />
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75">
                          </span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-700">
                          </span>
                        </span>
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="h-screen w-screen flex flex-col justify-center items-center gap-4">
                      <DrawerHeader>
                        <DrawerTitle>
                          معاينة مقطع الفيديو
                        </DrawerTitle>
                      </DrawerHeader>

                      <div className="w-full h-full flex justify-center items-start">
                        <video controls>
                          <source
                            src={getMediaURL(
                              questionne?.question_video,
                              "video",
                            )}
                          />
                        </video>
                      </div>
                      <DrawerFooter className="w-96">
                        <DrawerClose asChild>
                          <Button variant="outline">
                            خروج
                          </Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                )
                : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/series/results/$questionresult")({
  component: QuestionResultDetails,
});
