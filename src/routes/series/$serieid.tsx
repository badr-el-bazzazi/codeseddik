import { createFileRoute } from "@tanstack/react-router";
import { useContext, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import logo from "../../assets/logo1.png";
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
import { convertFileSrc } from "@tauri-apps/api/core";
interface Question {
  question_id: number;
  // question_image: Uint8Array;
  // question_audio: Uint8Array;
  // question_answer: Uint8Array;
  // question_video: Uint8Array;
  question_image: string;
  question_audio: string;
  question_answer: string;
  question_video: string;
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
interface ResultType {
  questionId: number;
  correct: boolean;
}

const SeriesPage = () => {
  const { serieid } = Route.useParams();

  const navigation = Route.useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);

  const inputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  let numbersList: number[] = [1, 2, 3, 4];
  let [time, setTime] = useState(30);

  let [otp, setOTP] = useState("");
  let [_, setBtnColor] = useState(false);

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

  const [questionPosition, setQuestionPosition] = useState<number>(0);

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
    setIsVideoEnded(true);
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


  // const getMediaURL = (mediaData: string | Uint8Array, type: string) => {
  //   if (!mediaData) return "";

  //   try {
  //     let uint8Array: Uint8Array;

  //     // Check if it's a base64-encoded image
  //     if (typeof mediaData === "string" && mediaData.startsWith("data:image")) {
  //       // If it's a base64-encoded string, no need for parsing, just handle it as a Blob
  //       return mediaData; // Directly return the base64 string as the src for the image
  //     }

  //     // Check if mediaData is a string and parse it (for non-image types)
  //     if (typeof mediaData === "string") {
  //       // Parse the string representation of the array
  //       const parsedMediaData = JSON.parse(mediaData);

  //       // Ensure it's an array-like structure of numbers
  //       if (
  //         !Array.isArray(parsedMediaData) ||
  //         !parsedMediaData.every((item) => typeof item === "number")
  //       ) {
  //         throw new Error("Invalid media data format");
  //       }

  //       // Convert the parsed array to Uint8Array
  //       uint8Array = new Uint8Array(parsedMediaData);
  //     } else {
  //       // If it's already a Uint8Array, use it directly
  //       uint8Array = mediaData;
  //     }

  //     // Determine MIME type based on the type parameter
  //     let mimeType: string;
  //     if (type === "audio") {
  //       mimeType = "audio/mpeg";
  //     } else if (type === "video") {
  //       mimeType = "video/mp4"; // Adjust for video
  //     } else if (type === "image") {
  //       mimeType = "image/jpeg"; // Adjust for images based on your data format
  //     } else {
  //       throw new Error("Unsupported media type");
  //     }

  //     // Create a blob and return the URL
  //     const blob = new Blob([uint8Array], { type: mimeType });
  //     return URL.createObjectURL(blob);
  //   } catch (error) {
  //     console.error("Error processing media data:", error);
  //     return "";
  //   }
  // };

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
            <p className="text-1xl font-bold">
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
            <p className="text-1xl font-bold">
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
        <div className="flex flex-col justify-center items-center gap-4 w-4/6 text-right flex-wrap" dir="rtl" >
          <div className="flex flex-col justify-center items-center gap-4">
            <p className="text-1xl font-bold">
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
            <p className="text-1xl font-bold">
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

  const [, setIsAudioEnded] = useState(false);

  // const [result, setResult] = useState<ResultType[]>([]);
  const [result, setResult] = useState<ResultType[]>([]);

  const [isQuizComplete, setIsQuizComplete] = useState(false);
  // const { mode, setMode } = useContext(ResultContext);

  const context = useContext(ResultContext);
  if (!context) {
    throw new Error("useContext must be used within ResultContextProvider");
  }

  const { mode } = context;
  const { setResultContext } = context;

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

  // // Use useEffect to log the final results once the quiz is marked complete
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

  //   useEffect(() => {
  //     if (isQuizComplete) {
  //         console.log("Final Results:", result);
  //         setResultContext(result);
  //         setIsQuizComplete(false);
  //         setQuestionPosition(0);
  //         setResult([]);
  //         navigation({ to: "/series/results" });
  //     }
  // }, [isQuizComplete, result]);

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
      // const hasVideoContent = !!questions[questionPosition]?.question_video &&
      //   questions[questionPosition]?.question_video.length > 0;
      const hasVideoContent = questions[questionPosition]?.question_video != ""
      setHasVideo(hasVideoContent);
      setVideoImage(false);
      setIsAudioPlayed(false);

      // answer controls btns

      if (acceptBtn.current && correctBtn.current && btnRefs.current) {
        acceptBtn.current.disabled = true;
        // correctBtn.current.disabled = true;

        // btnRefs.current.forEach((btn) => {
        //   if (btn) {
        //     btn.disabled = true;
        //   }
        // });
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
        // correctBtn.current.disabled = false;

        // btnRefs.current.forEach((btn) => {
        //   if (btn) {
        //     btn.disabled = false;
        //   }
        // });
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
    setIsVideoEnded(true);

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

  useEffect(() => {

    console.log(questions[questionPosition]?.question_image);
  })

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
                {/*
                
              */}
                <source
                  src={convertFileSrc(questions[questionPosition]?.question_video)}
                />
              </video>
            )
            : null}

          {videoImage && (
            <img
              src={convertFileSrc(questions[questionPosition]?.question_image)}
              className="w-full h-full object-contain absolute inset-0"
            />
          )}

          {!hasVideo
            ? (
              <img
                src={convertFileSrc(questions[questionPosition]?.question_image)}
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
              src={
                convertFileSrc(
                  questions[questionPosition]?.question_audio
                )
              }
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
            className={`flex justify-center items-center border rounded py-4  w-72 ${time <= 10 ? "bg-red-700" : ""
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
            {numbersList.map((_, index) => {
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
