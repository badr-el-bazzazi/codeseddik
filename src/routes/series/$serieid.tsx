import { createFileRoute } from "@tanstack/react-router";
import {  useContext, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import logo from "../../assets/logo1.png";
import { useToast } from "@/hooks/use-toast";
import Database from "@tauri-apps/plugin-sql";
import {
  ArrowBigLeft,
  ArrowBigRight,
  Pause,
  Play,
  Volume1,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultContext } from "@/components/ResultProvider";
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
const SeriesPage = () => {
  const { serieid } = Route.useParams();

  const { toast } = useToast();

  const navigation = Route.useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);

  const inputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  let numbersList: number[] = [1, 2, 3, 4];
  let [time, setTime] = useState(30);

  let [otp, setOTP] = useState("");
  let [btnColor, setBtnColor] = useState(false);
  let [questionOpen, setQuestionOPen] = useState(false);

  const handleInput = (num: number /*index : number*/) => {
    const inputix = (num + 1).toString();
    if (inputRefs.current[num] != null && !otp.includes(inputix)) {
      inputRefs.current[num].innerText = inputix;
      setOTP(otp.concat(inputix));
      setBtnColor(true);

      if (btnRefs.current[num] != null) {
        btnRefs.current[num].classList.add("bg-red-700");
      }
    } else {
      if (inputRefs.current[num] != null) {
        inputRefs.current[num].innerText = "";
        setOTP(otp.replace(inputix, ""));
        if (btnRefs.current[num] != null) {
          btnRefs.current[num].classList.remove("bg-red-700");
        }
      }
    }
  };

  const [timerStatus, setTimerStatus] = useState(false);

  const resetHandler = () => {
    inputRefs.current.map((ele) => {
      if (ele != null) {
        ele.innerText = "";
        setOTP("");

        removeClassHandler();
      }
    });
  };

  function removeClassHandler() {
    btnRefs.current.map((btn) => {
      btn?.classList.remove("bg-red-700");
    });
  }


  const [questionPosition, setQuestionPosition] = useState(0);

  const getSerieQuestions = async () => {
    try {
      const db = await Database.load("sqlite:roadcode.db");
      const result = await db.select(
        "SELECT * FROM QUESTIONS WHERE serie_id = $1 ORDER BY question_id ASC;", // Add ORDER BY to ensure consistent sorting
        [serieid],
      );

      if (Array.isArray(result)) {
        // Ensure questions are sorted by ID
        const sortedQuestions = result.sort((a, b) => a.id - b.id);

        setQuestions(sortedQuestions);
        return sortedQuestions;
      }
      return [];
    } catch (error) {
      console.error("Error details:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const fetchedQuestions = await getSerieQuestions();

        // If questions are retrieved, set the initial position to 0
        if (fetchedQuestions.length > 0) {
          setQuestionPosition(0);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    if (serieid) {
      fetchQuestions();
    }
  }, [serieid]); // Dependency on serieid ensures fetch when serieid changes


  const handlePrevQuestion = () => {
    // Filter out the result for the current question
    setResult(
      result?.filter((item) =>
        Number(item.questionId) !== questions[questionPosition].question_id
      ),
    );

    setQuestionPosition((prevPosition) => {
      if (prevPosition <= 0) {
        console.log("Already at first question");
        return prevPosition;
      }
      const newPosition = prevPosition - 1;
      console.log("Current questions:", questions);
      console.log(
        `Moving to previous question at position ${newPosition}:`,
        questions[newPosition],
      );
      return newPosition;
    });
  };

  const getMediaURL = (mediaData, type) => {
    if (!mediaData) return "";

    // Convert the string representation of array to Uint8Array
    const parsedMediaData = new Uint8Array(JSON.parse(mediaData));

    // Determine MIME type
    const mimeType = type === "audio" ? "audio/mpeg" : "image/jpeg"; // Use 'audio/mpeg' for MP3 or adjust as needed
    const blob = new Blob([parsedMediaData], { type: mimeType });

    return URL.createObjectURL(blob);
  };

  const getQuestionSuggestions = (question: Question) => {
    if (question) {
      return Object.entries(question)
        .filter(([key, value]) => key.startsWith("question_sug_") && value)
        .map(([_, value]) => value);
    }
  };

  const suggestions = getQuestionSuggestions(questions[questionPosition]);
  const questionsStrusture = () => {
    if (questions[questionPosition]?.question_type == "1QMS") {
      if (
        questions[questionPosition]?.question_sug_3 != "" ||
        questions[questionPosition]?.question_sug_4 != ""
      ) {
        return (
          <div
            className="text-right flex flex-col justify-center items-center gap-4 h-full w-full flex-wrap"
            dir="rtl"
          >
            <p className="text-1xl text-blue-700">
              {questions[questionPosition]?.question_1}
            </p>
            {suggestions?.map((item, index) => {
              return (
                <p key={index} className="text-1xl">
                  {item}
                </p>
              );
            })}
          </div>
        );
      } else {
        return (
          <div
            className="text-right flex flex-col justify-center items-center gap-4 h-full"
            dir="rtl"
          >
            <p className="text-1xl text-blue-700">
              {questions[questionPosition]?.question_1}
            </p>
            <div className="flex justify-center items-center gap-24 w-full">
              {suggestions?.map((item, index) => {
                return (
                  <p key={index} className="text-1xl">
                    {item}
                  </p>
                );
              })}
            </div>
          </div>
        );
      }
    } else {
      return (
        <div className="flex flex-col justify-center items-center gap-4 w-4/6 text-right flex-wrap">
          <div className="flex flex-col justify-center items-center gap-4">
            <p className="text-1xl text-blue-700">
              {questions[questionPosition]?.question_1}
            </p>

            <div className="flex justify-center items-center gap-12">
              <p className="text-1xl">
                {questions[questionPosition]?.question_sug_1}
              </p>
              <p className="text-1xl">
                {questions[questionPosition]?.question_sug_2}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center gap-4">
            <p className="text-1xl text-blue-700">
              {questions[questionPosition]?.question_2}
            </p>

            <div className="flex justify-center items-center gap-12">
              <p className="text-1xl">
                {questions[questionPosition]?.question_sug_3}
              </p>
              <p className="text-1xl">
                {questions[questionPosition]?.question_sug_4}
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  const audioRefQuestion = useRef<HTMLAudioElement | any>();
  const [isQuestionPlaying, setIsQuestionPlaying] = useState(false);
  const [questionVolume, setQuestionVolume] = useState(0.5);

  const [isAudioEnded, setIsAudioEnded] = useState(false);

  interface ResultType {
    questionId: String;
    correct: boolean;
  }

  const [result, setResult] = useState<ResultType[] | undefined>([]);

  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const { resultContext, setResultContext } = useContext(ResultContext);
  const { mode, setMode } = useContext(ResultContext);

  const handleAcceptClick = () => {
    const currentQuestion = questions[questionPosition];
    const isCorrect = otp == currentQuestion.correct_answer_code;

    // Update results, removing any existing result for this question first
    setResult((prevResults) => {
      // Filter out any existing result for this question
      const filteredResults = prevResults.filter(
        (item) => Number(item.questionId) !== currentQuestion.question_id,
      );
      // Add the new result
      return [...filteredResults, {
        questionId: currentQuestion.question_id,
        correct: isCorrect,
      }];
    });

    setOTP("");
    clearTimer();
    setTime(30);
    resetHandler();

    if (questionPosition < questions.length - 1) {
      handleNextQuestion();
      console.log(result);
    } else {
      setIsQuizComplete(true);
    }
  };

  // Use useEffect to log the final results once the quiz is marked complete
  useEffect(() => {
    if (isQuizComplete) {
      console.log("Final Results:", result);
      setResultContext(result);
      // Reset the quiz or navigate to the main page as needed
      setIsQuizComplete(false); // Reset for potential re-use of the component
      setQuestionPosition(0); // Reset question position
      setResult([]); // Clear the result for a fresh start
      navigation({ to: "/series/results" });
    }
  }, [isQuizComplete, result]);

  const [hasVideo, setHasVideo] = useState(false);
  const [videoImage, setVideoImage] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isAudioPlayed, setIsAudioPlayed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Persistent timer ref
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const correctBtn = useRef<HTMLButtonElement | null>(null);
  const acceptBtn = useRef<HTMLButtonElement | null>(null);

  const audioBtnRef = useRef<HTMLButtonElement | null>(null);

  const decreaseVolume = () => {
    if (audioRefQuestion.current) {
      if (questionVolume > 0) {
        const newVolume = Math.max(questionVolume - 0.1, 0); // Decrease volume by 0.1, min 0
        setQuestionVolume(newVolume);
        audioRefQuestion.current.volume = newVolume;
      }
    }
  };

  const increaseVolume = () => {
    if (audioRefQuestion.current) {
      if (questionVolume < 1) {
        const newVolume = Math.min(questionVolume + 0.1, 1); // Increase volume by 0.1, max 1
        setQuestionVolume(newVolume);
        audioRefQuestion.current.volume = newVolume;
      }
    }
  };

  // Handle timer reaching zero
  useEffect(() => {
    if (mode == "examen") {
      if (time === 0) {
        handleAcceptClick();
      }
    }
  }, [time]);

  // Handle media setup for each question
  useEffect(() => {
    const setupQuestion = () => {
      setIsVideoEnded(false);
      // Check if there's video content
      const hasVideoContent = !!questions[questionPosition]?.question_video &&
        questions[questionPosition]?.question_video.length > 0;

      setHasVideo(hasVideoContent);
      setVideoImage(false);
      setIsAudioPlayed(false);

      // answer controls btns

      if (acceptBtn.current && correctBtn.current && btnRefs.current) {
        acceptBtn.current.disabled = true;
        correctBtn.current.disabled = true;

        btnRefs.current.forEach((btn) => {
          if (btn) {
            btn.disabled = true;
          }
        });
      }

      // disable pause/play Button
      if (audioBtnRef.current) {
        audioBtnRef.current.disabled = true;
      }

      // Handle audio playback
      if (!hasVideoContent && audioRefQuestion.current) {
        audioRefQuestion.current.load();
        audioRefQuestion.current.play();
        if (audioBtnRef.current) {
          audioBtnRef.current.disabled = false;
        }
      }
    };

    // Clear existing timer before setting up new question
    clearTimer();
    setupQuestion();

    // Cleanup function
    return () => {
      clearTimer();
      if (audioRefQuestion.current) {
        audioRefQuestion.current.pause();
        audioRefQuestion.current.currentTime = 0;
      }
    };
  }, [questionPosition, questions]);

  const handleAudioEnd = () => {
    if (!isAudioPlayed && time > 0) {
      setIsAudioPlayed(true);
      startTimer();

      if (acceptBtn.current && correctBtn.current) {
        acceptBtn.current.disabled = false;
        correctBtn.current.disabled = false;

        btnRefs.current.forEach((btn) => {
          if (btn) {
            btn.disabled = false;
          }
        });
      }
    }
  };

  const startTimer = () => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          clearTimer();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleNextQuestion = () => {
    clearTimer();

    // Check if we've reached the end of the quiz
    if (questionPosition >= questions.length - 1) {
      setIsQuizComplete(true);
      return;
    }

    // Prepare for next question
    setTime(30);
    setIsAudioPlayed(false);

    // Use setTimeout to ensure state updates are processed before moving to next question
    setTimeout(() => {
      setQuestionPosition((prev) => prev + 1);
    }, 0);
  };

  const videoEnded = () => {
    console.log("video is finished");
    setIsVideoEnded(true);
    setVideoImage(true);
    if (audioBtnRef.current) {
      audioBtnRef.current.disabled = false;
    }
    if (audioRefQuestion.current) {
      audioRefQuestion.current.load();
      audioRefQuestion.current.play();
    }
  };

  return (
    <div className="h-screen grid grid-cols-4 overflow-hidden">
      {/*image erea*/}

      <div className=" max-h-screen flex flex-col col-start-1 col-end-4  overflow-hidden">
        <div className="h-4/5  border-b flex justify-center items-center overflow-hidden relative">
          {(hasVideo && !isVideoEnded)
            ? (
              <video
                autoPlay
                ref={videoRef}
                onEnded={videoEnded}
              >
                <source
                  src={getMediaURL(
                    questions[questionPosition]?.question_video,
                    "video",
                  )}
                />
              </video>
            )
            : null}

          {videoImage && (
            <img
              src={getMediaURL(
                questions[questionPosition]?.question_image,
                "image",
              )}
              className="w-full h-full object-contain absolute inset-0"
            />
          )}

          {!hasVideo
            ? (
              <img
                src={getMediaURL(
                  questions[questionPosition]?.question_image,
                  "image",
                )}
                className="w-full h-full object-contain absolute inset-0"
              />
            )
            : null}
          <audio
            className="hidden"
            ref={audioRefQuestion}
            key={questions[questionPosition]?.question_id}
            onEnded={handleAudioEnd}
          >
            <source
              src={getMediaURL(
                questions[questionPosition]?.question_audio,
                "audio",
              )}
            />
          </audio>
        </div>
        <div className="h-2/5 w-full relative flex justify-center items-center">
          <div className="p-4 bg-white text-black absolute top-0 right-0 rounded">
            {questionPosition + 1} السؤال
          </div>

          {questionsStrusture()}
        </div>
        <div
          className=" flex justify-center items-center gap-4 "
          style={{ height: "10%" }}
        >
          <div className="flex justify-center items-center gap-4  border rounded py-4  w-72">
            <Button
              onClick={() => decreaseVolume()}
            >
              <Volume1 />
            </Button>
            <div className="w-10 h-10 rounded bg-black text-white flex justify-center items-center ">
              {Math.floor(questionVolume * 100)}
            </div>

            <Button
              onClick={() => increaseVolume()}
            >
              <Volume2 />
            </Button>
          </div>

          {mode == "learning"
            ? (
              <div className="flex justify-center items-center gap-4 border rounded py-4  w-72">
                <Button
                  onClick={() => {
                    handlePrevQuestion();
                  }}
                >
                  <ArrowBigLeft />
                </Button>

                <Button
                  ref={audioBtnRef}
                  onClick={() => {
                    if (audioRefQuestion.current.paused) {
                      audioRefQuestion.current.play();
                      setIsQuestionPlaying(true);
                      setTimerStatus(!timerStatus);
                      setIsAudioEnded(false);
                    } else {
                      audioRefQuestion.current.pause();
                      setIsQuestionPlaying(false);
                      setIsAudioEnded(true);
                    }
                  }}
                >
                  {isQuestionPlaying ? <Pause /> : <Play />}
                </Button>
                <Button
                  onClick={() => {
                    handleAcceptClick();
                  }}
                >
                  <ArrowBigRight />
                </Button>
              </div>
            )
            : null}

          <div
            className={`flex justify-center items-center border rounded py-4  w-72 ${
              time <= 10 ? "bg-red-700" : ""
            } `}
          >
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              {time} s
            </h2>
          </div>
        </div>
      </div>

      {/*answer controls erea*/}
      {/* ################### START ####################*/}
      <div className=" col-start-4 col-end-5 flex flex-col justify-around pt-8 items-center border-l ">
        <div className="flex flex-col gap-8">
          <div className="flex gap-4 justify-center ">
            {numbersList.map((item, index) => {
              return (
                <div
                  className="h-12 w-12 p-4 border-solid border-2 border-white text-center font-bold"
                  key={index}
                  ref={(el) => {
                    if (inputRefs.current != null) {
                      inputRefs.current[index] = el;
                    }
                  }}
                >
                </div>
              );
            })}
          </div>
          <div className="flex flex-col justify-center items-center gap-4">
            <Button
              variant="destructive"
              onClick={() => {
                resetHandler();
              }}
              className="text-3xl h-fit w-24"
              ref={correctBtn}
            >
              تصحيح
            </Button>
            {numbersList.map((itemNum, itemIndex) => {
              return (
                <Button
                  key={itemIndex}
                  onClick={() => {
                    handleInput(itemIndex);
                  }}
                  ref={(btn) => {
                    if (btnRefs.current != null) {
                      btnRefs.current[itemIndex] = btn;
                    }
                  }}
                  className="w-24 h-12"
                >
                  {itemNum}
                </Button>
              );
            })}

            {/* ACEEPT BUTTON */}
            <Button
              onClick={() => {
                handleAcceptClick();
              }}
              className="text-3xl h-fit  w-24"
              variant={"accept"}
              ref={acceptBtn}
            >
              تاكيد
            </Button>
            <Button
              onClick={() => {
                navigation({
                  to: `/`,
                });
              }}
              className="flex justify-center items-center gap-2"
            >
              <ArrowLeft className="w-4" />
              رجوع
            </Button>
          </div>
        </div>
        <div>
          <img src={logo} alt="logo" className="w-52" />
        </div>
      </div>

      {/*########################## END #################### */}
    </div>
  );
};

export const Route = createFileRoute("/series/$serieid")({
  component: SeriesPage,
});
