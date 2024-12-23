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

  const [questione, setQuestion] = useState<Question>();

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
    // console.log(questione);
    return () => {
    };
  }, []);

  // useEffect(() => {
  //   console.log(questione);
  // })

  const getMediaURL = (
    mediaData: string | Uint8Array,
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

  const suggestions = getQuestionSuggestions(questione);

  const questionsStrusture = () => {
    const correctAnswers =
      questione?.correct_answer_code?.toString()?.split("").map(Number) || [];
    const isCorrect = (index: number) => correctAnswers.includes(index + 1);

    if (questione?.question_type === "1QMS") {
      if (
        questione?.question_sug_3 !== "" ||
        questione?.question_sug_4 !== ""
      ) {
        return (
          <div
            className="text-right flex flex-col justify-center items-center gap-4 h-full w-full font-bold "
            dir="rtl"
          >
            <p className="text-2xl text-center font-bold">
              {questione?.question_1}
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
            <p className="text-2xl font-bold">
              {questione?.question_1}
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
            <p className="text-2xl font-bold">
              {questione?.question_1}
            </p>
            <div className="flex justify-center items-center gap-12">
              <div className="flex items-center gap-2">
                <p className="text-2xl">{questione?.question_sug_1}</p>
                {isCorrect(0)
                  ? <Check className="text-green-500 w-6 h-6" />
                  : <X className="text-red-500 w-6 h-6" />}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl">{questione?.question_sug_2}</p>
                {isCorrect(1)
                  ? <Check className="text-green-500 w-6 h-6" />
                  : <X className="text-red-500 w-6 h-6" />}
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center gap-4">
            <p className="text-2xl text-center font-bold">
              {questione?.question_2}
            </p>
            <div className="flex justify-center items-center gap-12">
              <div className="flex items-center gap-2">
                <p className="text-2xl text-center">
                  {questione?.question_sug_3}
                </p>
                {isCorrect(2)
                  ? <Check className="text-green-500 w-6 h-6" />
                  : <X className="text-red-500 w-6 h-6" />}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl text-center">
                  {questione?.question_sug_4}
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
      !!questione?.question_video && questione?.question_video.length > 0,
    );
  });

  return (
    <div className="container mx-auto h-screen w-screen ">
      <div className="w-full h-full grid grid-rows-2  overflow-hidden ">
        <div className="row-start-1 row-end-2  border-b flex justify-center items-center overflow-hidden relative h-full">
          {questione?.question_image && (
            <img
              src={getMediaURL(questione.question_image, "image")}
              alt="question image"
              className="w-full h-full object-contain absolute inset-0"
            />
          )}
        </div>
        <div className="row-start-2 row-end-3 flex flex-col">
          {questione?.question_answer && (
            <div className="hidden">
              <audio controls ref={audioRefAnswer}>
                <source
                  src={getMediaURL(questione.question_answer, "audio")}
                />
              </audio>
            </div>
          )}

          <div className="" style={{ height: "100%" }}>
            {questionsStrusture()}
          </div>

          <Card style={{ height: "11%" }}>
            <CardContent className="flex flex-row justify-center items-center gap-2 w-full">
              <div className="bg-white w-12 h-10 text-black rounded flex justify-center items-center">
                {Math.floor(answerVolume * 100)}%
              </div>
              <div>
                <Button
                  onClick={() => {
                    // if (answerVolume > 0) {
                    //   const newVolume = Math.max(answerVolume - 0.1, 0); // Decrease volume by 0.1, min 0
                    //   setAnswerVolume(newVolume);
                    //   audioRefAnswer.current.volume = newVolume;
                    // }

                    try {
                      if (answerVolume > 0 && audioRefAnswer.current) {
                        const newVolume = Math.max(answerVolume - 0.1, 0);
                        setAnswerVolume(newVolume);
                        audioRefAnswer.current.volume = newVolume;
                      }
                    } catch (error) {
                      console.error("Error decreasing volume:", error);
                    }
                  }}
                >
                  <Volume1 />
                </Button>
              </div>
              <div>
                <Button
                  onClick={() => {
                    try {
                      if (!audioRefAnswer.current) return;

                      if (audioRefAnswer.current.paused) {
                        audioRefAnswer.current.play()
                          .then(() => setIsAnswerPlaying(true))
                          .catch((error: any) => {
                            console.error("Error playing audio:", error);
                            setIsAnswerPlaying(false);
                          });
                      } else {
                        audioRefAnswer.current.pause();
                        setIsAnswerPlaying(false);
                      }
                    } catch (error) {
                      console.error("Error controlling playback:", error);
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
                    // audioRefAnswer.current.currentTime = 0;
                    // setIsAnswerPlaying(true);

                    try {
                      if (audioRefAnswer.current) {
                        audioRefAnswer.current.currentTime = 0;
                        audioRefAnswer.current.play()
                          .then(() => setIsAnswerPlaying(true))
                          .catch((error: any) => {
                            console.error("Error restarting audio:", error);
                            setIsAnswerPlaying(false);
                          });
                      }
                    } catch (error) {
                      console.error("Error resetting audio:", error);
                    }
                  }}
                >
                  <RotateCcw />
                </Button>
              </div>

              <div>
                <Button
                  onClick={() => {
                    try {
                      if (answerVolume < 1 && audioRefAnswer.current) {
                        const newVolume = Math.min(answerVolume + 0.1, 1);
                        setAnswerVolume(newVolume);
                        audioRefAnswer.current.volume = newVolume;
                      }
                    } catch (error) {
                      console.error("Error increasing volume:", error);
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
                        {questione?.question_video && (
                          <div>
                            <video controls>
                              <source
                                src={getMediaURL(
                                  questione.question_video,
                                  "video",
                                )}
                              />
                            </video>
                          </div>
                        )}
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
