import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Pause,
  Pen,
  Play,
  RotateCcw,
  SquarePlay,
  Volume1,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Database from "@tauri-apps/plugin-sql";
import { createFileRoute } from "@tanstack/react-router";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { useToast } from "@/hooks/use-toast";

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

const QuestionDtail = () => {
  const { questionid } = Route.useParams();

  const [questionne, setQuestion] = useState<Question | null>(null);

  const { toast } = useToast();
  const navigation = Route.useNavigate();

  const formSchema = z.object({
    questionType: z.string({
      required_error: "Please select an item to display.",
    }),
    question1: z.string({
      required_error: "Please enter a question .",
    }),
    question2: z.string(),
    questionSug1: z.string({
      required_error: "Please enter a question sug 1 .",
    }),
    questionSug2: z.string({
      required_error: "Please enter a question sug 2 .",
    }),
    questionSug3: z.string(),
    questionSug4: z.string(),
    questionCorrectAnswer: z.string({
      required_error: "please enter the correct answer",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questionType: questionne?.question_type,
      question1: questionne?.question_1,
      question2: questionne?.question_2,
      questionSug1: questionne?.question_sug_1,
      questionSug2: questionne?.question_sug_2,
      questionSug3: questionne?.question_sug_3,
      questionSug4: questionne?.question_sug_4,
      questionCorrectAnswer: questionne?.correct_answer_code,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateQuestionsHandler(values);
  };

  const updateQuestionsHandler = async (values: any) => {
    try {
      const db = await Database.load("sqlite:roadcode.db");
      await db.execute(
        "UPDATE QUESTIONS SET question_type = $1 , question_1 = $2 , question_2 = $3 , question_sug_1 = $4 , question_sug_2 = $5 , question_sug_3 = $6 , question_sug_4 = $7 , correct_answer_code = $8 WHERE question_id = $9;",
        [
          values.questionType,
          values.question1,
          values.question2,
          values.questionSug1,
          values.questionSug2,
          values.questionSug3,
          values.questionSug4,
          parseInt(values.questionCorrectAnswer),
          questionid,
        ],
      );
      getQuestion(parseInt(questionid));
      toast({
        variant: "succ",
        title: " لقد تم تحديث السؤال بنجاح",
        duration: 1000,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "لقد حدث خطأ، المرجو المحاولة بعد قليل",
        duration: 1000,
      });
      console.error("something went wrong ", error);
    }
  };

  const imageFormSchema = z.object({
    question_image: z.instanceof(File),
  });

  const imageForm = useForm<z.infer<typeof imageFormSchema>>({
    resolver: zodResolver(imageFormSchema),
    defaultValues: {
      question_image: new File([], ""),
    },
  });

  const onSubmitImage = (values: z.infer<typeof imageFormSchema>) => {
    console.log(values);
    questionImageUpdeteHandler();

    if (questionImageRef.current) {
      questionImageRef.current.value = "";
    }
    console.log("image is updated");

    toast({
      variant: "succ",
      title: "لقد تم تحديث الصورة بنجاح",
      duration: 1000,
    });
  };

  const questionImageUpdeteHandler = async () => {
    try {
      const db = await Database.load("sqlite:roadcode.db");
      await db.execute(
        "UPDATE QUESTIONS SET question_image = $1 WHERE question_id = $2; ",
        [
          fileData[0],
          questionne?.question_id,
        ],
      );

      getQuestion(parseInt(questionid));
      setFileData([]); // Clear the file data after successful insert
    } catch (error) {
      console.error("somwthing went wrong ", error);
      toast({
        variant: "destructive",
        title: "لقد حدث خطأ، المرجو المحاولة بعد قليل",
        duration: 1000,
      });
    }
  };

  const videoFormSchema = z.object({
    question_video: z.instanceof(File),
  });

  const videoForm = useForm<z.infer<typeof videoFormSchema>>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      question_video: new File([], ""),
    },
  });

  const onSubmitVideo = (values: z.infer<typeof videoFormSchema>) => {
    console.log(values);
    questionVideoUpdeteHandler();

    if (questionVideoRef.current) {
      questionVideoRef.current.value = "";
    }
    toast({
      variant: "succ",
      title: "لقد تم تحديث الفيديو بنجاح",
      duration: 1000,
    });
  };

  const questionVideoUpdeteHandler = async () => {
    try {
      const db = await Database.load("sqlite:roadcode.db");
      await db.execute(
        "UPDATE QUESTIONS SET question_video = $1 WHERE question_id = $2; ",
        [
          fileData[0],
          questionne?.question_id,
        ],
      );

      getQuestion(parseInt(questionid));
      setFileData([]); // Clear the file data after successful insert
    } catch (error) {
      console.error("somwthing went wrong ", error);
      toast({
        variant: "destructive",
        title: "لقد حدث خطأ، المرجو المحاولة بعد قليل",
        duration: 1000,
      });
    }
  };

  const questionAudioFormSchema = z.object({
    question_audio: z.instanceof(File),
  });

  const questionAudioForm = useForm<z.infer<typeof questionAudioFormSchema>>({
    resolver: zodResolver(questionAudioFormSchema),
    defaultValues: {
      question_audio: new File([], ""),
    },
  });

  const onSubmitQuestionAudio = (
    values: z.infer<typeof questionAudioFormSchema>,
  ) => {
    console.log(values);
    questionAudioUpdeteHandler();

    if (questionAudioRef.current) {
      questionAudioRef.current.value = "";
    }
    getQuestion(parseInt(questionid));
    console.log("question audio updated");
    toast({
      variant: "succ",
      title: "لقد تم تحديث المقطع الصوتي ـ السؤال بنجاح",
      duration: 1000,
    });
  };

  const questionAudioUpdeteHandler = async () => {
    try {
      const db = await Database.load("sqlite:roadcode.db");
      await db.execute(
        "UPDATE QUESTIONS SET question_audio = $1 WHERE question_id = $2; ",
        [
          fileData[0],
          questionne?.question_id,
        ],
      );

      getQuestion(parseInt(questionid));
      setFileData([]); // Clear the file data after successful insert
    } catch (error) {
      console.error("somwthing went wrong ", error);
      toast({
        variant: "destructive",
        title: "لقد حدث خطأ، المرجو المحاولة بعد قليل",
        duration: 1000,
      });
    }
  };
  const answerAudioFormSchema = z.object({
    question_answer: z.instanceof(File),
  });

  const answerAudioForm = useForm<z.infer<typeof answerAudioFormSchema>>({
    resolver: zodResolver(answerAudioFormSchema),
    defaultValues: {
      question_answer: new File([], ""),
    },
  });

  const onSubmitAnswer = (values: z.infer<typeof answerAudioFormSchema>) => {
    console.log(values);
    questionAnswerUpdeteHandler();
    if (questionAnswerRef.current) {
      questionAnswerRef.current.value = "";
    }
    // getQuestion(parseInt(questionid));
    console.log("answer is updated");
    toast({
      variant: "succ",
      title: "لقد تم تحديث المقطع الصوتي ـ الجواب بنجاح",
      duration: 1000,
    });
  };
  const questionAnswerUpdeteHandler = async () => {
    try {
      const db = await Database.load("sqlite:roadcode.db");
      await db.execute(
        "UPDATE QUESTIONS SET question_answer = $1 WHERE question_id = $2; ",
        [
          fileData[0],
          questionne?.question_id,
        ],
      );

      getQuestion(parseInt(questionid));
      console.log("question answer is updated");
      setFileData([]); // Clear the file data after successful insert
    } catch (error) {
      console.error("somwthing went wrong ", error);

      toast({
        variant: "destructive",
        title: "لقد حدث خطأ، المرجو المحاولة بعد قليل",
        duration: 1000,
      });
    }
  };

  const [hasVideo, setHasVideo] = useState<boolean>(false);

  const getQuestion = async (question_id: number) => {
    try {
      const db = await Database.load("sqlite:roadcode.db");
      const result = await db.select<Question[]>(
        "SELECT * FROM QUESTIONS WHERE question_id = $1;",
        [question_id],
      );

      if (Array.isArray(result) && result.length > 0) {
        const questionData = result[0];

        setHasVideo(
          !!questionData.question_video &&
            questionData.question_video.length > 0,
        );
        setQuestion(questionData);
        return { questionData, hasVideo };
      } else {
        throw new Error("No question found with the given ID");
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      setQuestion(null);
    }
  };

  const convertFileToBlob = (file: any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        // Convert ArrayBuffer to Uint8Array for SQLite BLOB storage
        if (arrayBuffer != null) {
          const uint8Array = new Uint8Array(arrayBuffer as ArrayBufferLike);
          resolve(uint8Array);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = async (e: any, field: any, setFileData: any) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        field.onChange(file); // Update form field
        const blobData = await convertFileToBlob(file);
        setFileData((prevData: any) => [...prevData, blobData]);
      } catch (error) {
        console.error("Error processing file:", error);
      }
    }
  };

  const [fileData, setFileData] = useState<Uint8Array[]>([]);

  // for audios card and controls
  const audioRefQuestion = useRef<HTMLAudioElement | any>();
  const audioRefAnswer = useRef<HTMLAudioElement | any>();

  const [questionVolume, setQuestionVolume] = useState(0.5);
  const [answerVolume, setAnswerVolume] = useState(0.5);

  const [isQuestionPlaying, setIsQuestionPlaying] = useState(false);
  const [isAnswerPlaying, setIsAnswerPlaying] = useState(false);

  // for audios and image inputs
  const questionAnswerRef = useRef<HTMLInputElement>(null);
  const questionImageRef = useRef<HTMLInputElement>(null);
  const questionAudioRef = useRef<HTMLInputElement>(null);
  const questionVideoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      await getQuestion(parseInt(questionid));
    };

    fetchData();

    return () => {
    };
  }, []);

  useEffect(() => {
    if (audioRefQuestion.current) {
      audioRefQuestion.current.volume = questionVolume;
    }
  }, [questionVolume]);

  const transformData = (questionne: any) => {
    return {
      questionType: questionne?.question_type || "1QMS",
      question1: questionne?.question_1,
      question2: questionne?.question_2,
      questionSug1: questionne?.question_sug_1,
      questionSug2: questionne?.question_sug_2,
      questionSug3: questionne?.question_sug_3,
      questionSug4: questionne?.question_sug_4,
      questionCorrectAnswer: `${questionne?.correct_answer_code}`,
    };
  };

  useEffect(() => {
    if (questionne) {
      form.reset(transformData(questionne));
    }
  }, [questionne]);

  const getMediaURL = (mediaData: any, type: string) => {
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

  return (
    <div className="grid grid-cols-3 h-screen overflow-hidden">
      <div className="col-start-1 col-end-3 grid grid-rows-2 max-h-screen overflow-hidden ">
        <div className="row-start-1 row-end-2 border-b flex justify-center items-center overflow-hidden relative h-full ">
          {questionne?.question_image && (
            <img
              src={getMediaURL(questionne.question_image, "image")}
              alt="question image"
              className="w-full h-full object-contain absolute inset-0"
            />
          )}

          {hasVideo
            ? (
              <Drawer>
                <DrawerTrigger asChild>
                  <Button className="z-10  right-4 bottom-1 absolute flex gap-4">
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
                        src={getMediaURL(questionne?.question_video, "video")}
                      />
                    </video>
                  </div>
                  <Card className="w-96 " dir="rtl">
                    <CardHeader>
                      <CardTitle>
                        مقطع الفيديو
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center items-center">
                      <Form {...videoForm}>
                        <form
                          onSubmit={videoForm.handleSubmit(
                            onSubmitVideo,
                          )}
                        >
                          <div className="flex flex-col justify-center items-center gap-4 text-right">
                            <FormField
                              control={videoForm.control}
                              name="question_video"
                              render={({ field }) => (
                                <FormItem className="w-60">
                                  <FormControl>
                                    <Input
                                      ref={questionVideoRef}
                                      type="file"
                                      accept="video/*"
                                      onChange={(e) =>
                                        handleFileChange(
                                          e,
                                          field,
                                          setFileData,
                                        )}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-2">
                              <Button
                                type="submit"
                                onClick={() => {
                                  toast({
                                    title: "question added ",
                                    description:
                                      "Friday, February 10, 2023 at 5:57 PM",
                                    duration: 1500,
                                  });
                                }}
                                className="flex justify-center items-center gap-2"
                              >
                                <Pen className="w-4" />
                                تعديل
                              </Button>
                            </div>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
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
        </div>

        <div className="row-start-2 row-end-3 overflow-y-auto">
          <div className="flex justify-center itams-center gap-4 py-4">
            <Card className="w-96 text-right">
              <CardHeader>
                <CardTitle>
                  السؤال
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="hidden">
                  <audio
                    controls
                    ref={audioRefQuestion}
                  >
                    <source
                      src={getMediaURL(
                        questionne?.question_audio,
                        "audio",
                      )}
                      type="audio/mpeg"
                    />
                  </audio>
                </div>
                <div className="flex justify-center items-center gap-4 ">
                  {Math.floor(questionVolume * 100)}
                  <Button
                    onClick={() => {
                      if (questionVolume > 0) {
                        const newVolume = Math.max(questionVolume - 0.1, 0); // Decrease volume by 0.1, min 0
                        setQuestionVolume(newVolume);
                        audioRefQuestion.current.volume = newVolume;
                      }
                    }}
                  >
                    <Volume1 />
                  </Button>

                  <Button
                    onClick={() => {
                      if (audioRefQuestion.current.paused) {
                        audioRefQuestion.current.play();
                        setIsQuestionPlaying(true);
                      } else {
                        audioRefQuestion.current.pause();
                        setIsQuestionPlaying(false);
                      }
                    }}
                  >
                    {isQuestionPlaying ? <Pause /> : <Play />}
                  </Button>

                  <Button
                    onClick={() => {
                      audioRefQuestion.current.currentTime = 0;
                      setIsQuestionPlaying(true);
                    }}
                  >
                    <RotateCcw />
                  </Button>

                  <Button
                    onClick={() => {
                      if (questionVolume < 1) {
                        const newVolume = Math.min(questionVolume + 0.1, 1); // Increase volume by 0.1, max 1
                        setQuestionVolume(newVolume);
                        audioRefQuestion.current.volume = newVolume;
                      }
                    }}
                  >
                    <Volume2 />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="w-96 text-right">
              <CardHeader>
                <CardTitle>
                  الجواب
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                <div className="flex justify-center items-center gap-4 ">
                  {Math.floor(answerVolume * 100)}
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

                  <Button
                    onClick={() => {
                      audioRefAnswer.current.currentTime = 0;
                      setIsAnswerPlaying(true);
                    }}
                  >
                    <RotateCcw />
                  </Button>

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
              </CardContent>
            </Card>
          </div>
          <div className="px-4 overflow-y-auto flex justify-center items-center gap-4 text-right ">
            <Card>
              <CardHeader>
                <CardTitle>
                  صورة السؤال
                </CardTitle>
              </CardHeader>
              <CardContent className="w-64">
                <Form {...imageForm}>
                  <form
                    onSubmit={imageForm.handleSubmit(
                      onSubmitImage,
                    )}
                  >
                    <div className="flex flex-col justify-center items-center gap-4 text-right">
                      <FormField
                        control={imageForm.control}
                        name="question_image"
                        render={({ field }) => (
                          <FormItem className="w-60">
                            <FormControl>
                              <Input
                                ref={questionImageRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleFileChange(
                                    e,
                                    field,
                                    setFileData,
                                  )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <Button
                          type="submit"
                          onClick={() => {
                            toast({
                              title: "question added ",
                              description:
                                "Friday, February 10, 2023 at 5:57 PM",
                              duration: 1500,
                            });
                          }}
                          className="flex justify-center items-center gap-2"
                        >
                          <Pen className="w-4" />
                          تعديل
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  المقطع الصوتي - السؤال
                </CardTitle>
              </CardHeader>
              <CardContent className="w-64">
                <Form {...questionAudioForm}>
                  <form
                    onSubmit={questionAudioForm.handleSubmit(
                      onSubmitQuestionAudio,
                    )}
                  >
                    <div className="flex flex-col justify-center items-center gap-4 text-right">
                      <FormField
                        control={questionAudioForm.control}
                        name="question_audio"
                        render={({ field }) => (
                          <FormItem className="w-60">
                            <FormControl>
                              <Input
                                ref={questionAudioRef}
                                type="file"
                                accept="audio/*"
                                onChange={(e) =>
                                  handleFileChange(
                                    e,
                                    field,
                                    setFileData,
                                  )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <Button
                          type="submit"
                          onClick={() => {
                            toast({
                              title: "question added ",
                              description:
                                "Friday, February 10, 2023 at 5:57 PM",
                              duration: 1500,
                            });
                          }}
                          className="flex justify-center items-center gap-2"
                        >
                          <Pen className="w-4" />
                          تعديل
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  المقطع الصوتي - الجواب
                </CardTitle>
              </CardHeader>
              <CardContent className="w-64">
                <Form {...answerAudioForm}>
                  <form
                    onSubmit={answerAudioForm.handleSubmit(
                      onSubmitAnswer,
                    )}
                  >
                    <div className="flex flex-col justify-center items-center gap-4 text-right">
                      <FormField
                        control={answerAudioForm.control}
                        name="question_answer"
                        render={({ field }) => (
                          <FormItem className="w-60">
                            <FormControl>
                              <Input
                                ref={questionAnswerRef}
                                type="file"
                                accept="audio/*"
                                onChange={(e) =>
                                  handleFileChange(
                                    e,
                                    field,
                                    setFileData,
                                  )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <Button
                          type="submit"
                          onClick={() => {
                            toast({
                              title: "question added ",
                              description:
                                "Friday, February 10, 2023 at 5:57 PM",
                              duration: 1500,
                            });
                          }}
                          className="flex justify-center items-center gap-2"
                        >
                          <Pen className="w-4" />
                          تعديل
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ###### THIS SECTION IS FORM UPDATE ######### */}

      <div className="col-start-3 col-end-4 border h-screen justify-center items-center h-screen ">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col justify-center items-center gap-4 h-full text-right "
          >
            <FormField
              control={form.control}
              name="questionType"
              render={({ field }) => (
                <FormItem className="w-60">
                  <FormLabel>نوع السؤال</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    dir="rtl"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="sélectionner une type de question" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1QMS">1QMS</SelectItem>
                      <SelectItem value="2Q4S">2Q4S</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="question1"
              render={({ field }) => (
                <FormItem className="w-60">
                  <FormLabel>السؤال رقم 1</FormLabel>
                  <FormControl>
                    <Input {...field} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="question2"
              render={({ field }) => (
                <FormItem className="w-60">
                  <FormLabel>السؤال رقم 2</FormLabel>
                  <FormControl>
                    <Input {...field} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="questionSug1"
              render={({ field }) => (
                <FormItem className="w-60">
                  <FormLabel>اجابة 1</FormLabel>
                  <FormControl>
                    <Input {...field} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="questionSug2"
              render={({ field }) => (
                <FormItem className="w-60">
                  <FormLabel>اجابة 2</FormLabel>
                  <FormControl>
                    <Input {...field} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="questionSug3"
              render={({ field }) => (
                <FormItem className="w-60">
                  <FormLabel>اجابة 3</FormLabel>
                  <FormControl>
                    <Input {...field} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="questionSug4"
              render={({ field }) => (
                <FormItem className="w-60">
                  <FormLabel>4 اجابة</FormLabel>
                  <FormControl>
                    <Input {...field} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="questionCorrectAnswer"
              render={({ field }) => (
                <FormItem className="w-60">
                  <FormLabel>
                    ارقام الاجوبة الصحيحة
                  </FormLabel>
                  <FormControl>
                    <Input {...field} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center items-center gap-4">
              <Button
                type="submit"
                onClick={() => {
                  toast({
                    title: "question added ",
                    description: "Friday, February 10, 2023 at 5:57 PM",
                    duration: 1500,
                  });
                }}
                className="flex justify-center items-center gap-2"
              >
                <Pen className="w-4" />
                تعديل
              </Button>

              <Button
                onClick={() => {
                  navigation({
                    to: `/series/serie_details/${questionne?.serie_id}`,
                  });
                }}
                className="flex justify-center items-center gap-2"
              >
                <ArrowLeft className="w-4" />
                رجوع
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export const Route = createFileRoute(
  "/series/serie_details/question_details/$questionid",
)({
  component: QuestionDtail,
});
