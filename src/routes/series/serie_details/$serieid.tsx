import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye, Pen, Trash2, ImageUp, Clapperboard, FileAudio, FileAudio2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import Database from "@tauri-apps/plugin-sql";
// import {  exists } from "@tauri-apps/plugin-fs";
// import { BaseDirectory } from "@tauri-apps/api/path";
import { exists, BaseDirectory, mkdir, copyFile } from '@tauri-apps/plugin-fs';
import { basename, join, appConfigDir, extname } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { createFileRoute } from "@tanstack/react-router";
// import { ResultContext } from "@/components/ResultProvider";
// import { Navigate } from "@tanstack/react-router";

interface SerieType {
  serie_id: number;
  description: string;
  category: string;
}
// interface valuesType {
//   question1: string;
//   question2: string;
//   questionSug1: string;
//   questionSug2: string;
//   questionSug3: string;
//   questionSug4: string;
//   questionCorrectAnswer: number;
//   questionType: string;
// }
interface Question {
  question_id: number;
  question_type: string;
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
  serie_id: number;
}
const formSchema = z.object({
  question_type: z.string({
    required_error: "Please select an item to display.",
  }),
  question_image: z.instanceof(File),
  question_audio: z.instanceof(File),
  question_answer: z.instanceof(File),
  question_video: z.instanceof(File),
  question_1: z.string({
    required_error: "Please enter a question .",
  }),
  question_2: z.string(),
  question_sug_1: z.string({
    required_error: "Please enter a question sug 1 .",
  }),
  question_sug_2: z.string({
    required_error: "Please enter a question sug 2 .",
  }),
  question_sug_3: z.string(),
  question_sug_4: z.string(),
  correct_answer_code: z.string({
    required_error: "please enter the correct answer",
  }),
});

const serieDetails = () => {
  const { serieid } = Route.useParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question_type: "",
      question_image: new File([], ""),
      question_audio: new File([], ""),
      question_answer: new File([], ""),
      question_video: new File([], ""),
      question_1: "",
      question_2: "",
      question_sug_1: "",
      question_sug_2: "",
      question_sug_3: "",
      question_sug_4: "",
      correct_answer_code: "",
    },
  });

  // const onSubmit = (values: z.infer<typeof formSchema>) => {
  //   questionInsertHandler(values : formSchema);
  // };  
  const onSubmit = (values: any) => {
    questionInsertHandler(values);
  };


  const serieFormSchema = z.object({
    serieName: z.string(),
    serieCategory: z.string(),
  });


  const serieForm = useForm<z.infer<typeof serieFormSchema>>({
    resolver: zodResolver(serieFormSchema),
    defaultValues: {
      serieName: "",
      serieCategory: "",
    },
  });

  const onSubmitSerie = (values: z.infer<typeof serieFormSchema>) => {
    serieUpdateHandler(values.serieName, values.serieCategory);
    getSerieArray();
    toast({
      title: "تم تحديث السلسلة بنجاح",
      duration: 1000,
    });
  };


  const serieFormResultSchema = z.object({
    serie_result: z.instanceof(File),
  });

  const serieFormResult = useForm<z.infer<typeof serieFormResultSchema>>({
    resolver: zodResolver(serieFormResultSchema),
    defaultValues: {
      serie_result: new File([], ""),
    },
  });

  const onSubmitSerieResult = (values: z.infer<typeof serieFormResultSchema>) => {

    serieResultUpdateHandler();
    console.log("hadchi ghadi o kay9wad", values);
    toast({
      title: "تم تحديث السلسلة بنجاح",
      duration: 1000,
    });
  };

  // const onSubmitSerieResult = (values: z.infer<typeof serieFormResultSchema>) => {
  //   // serieUpdateHandler(values.serieName, values.serieCategory);
  //   // getSerieArray();
  //   toast({
  //     title: "تم تحديث السلسلة بنجاح",
  //     duration: 1000,
  //   });
  // };

  const convertFileToBlob = (file: Object) => {
    // console.log(typeof file);
    // console.log(file)
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
      reader.readAsArrayBuffer(file as Blob);
    });
  };

  const { toast } = useToast();

  const questionDeleteHandler = async (question_id: number) => {
    const db = await Database.load("sqlite:roadcode.db");
    await db.execute("DELETE FROM QUESTIONS WHERE question_id = $1;", [
      question_id,
    ]);

    console.log("delete is clicked");
  };

  // const resourceFolder = async () => {

  //   const resources = await exists('resouces', {
  //     baseDir: BaseDirectory.AppConfig,
  //   })

  //   if (resources) {
  //     console.log("hadchi rah kayn");
  //   } else {
  //     await mkdir('resources', {
  //       baseDir: BaseDirectory.AppConfig,
  //     });
  //   }
  // }

  const questionInsertHandler = async (values: Question) => {
    // console.log(typeof values);
    // resourceFolder();

    const questionImagePathh = await copyFileToResources(questionImagePath);
    const questionAudioPathh = await copyFileToResources(questionAudioPath);
    const answerAudioPathh = await copyFileToResources(answerAudioPath);
    const questionVideoPathh = await copyFileToResources(questionVideoPath);

    try {
      const db = await Database.load("sqlite:roadcode.db");

      await db.execute(
        `INSERT INTO Questions (
          question_type,
          question_image,
          question_audio,
          question_answer,
          question_video,
          question_1,
          question_2,
          question_sug_1,
          question_sug_2,
          question_sug_3,
          question_sug_4,
          correct_answer_code,
          serie_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)`,
        [
          values.question_type,
          // fileData[0], // Image blob
          // fileData[1], // Audio blob
          // fileData[2], // Audio blob
          // fileData[3], // Video blob
          questionImagePathh,
          questionAudioPathh,
          answerAudioPathh,
          questionVideoPathh,
          values.question_1,
          values.question_2,
          values.question_sug_1,
          values.question_sug_2,
          values.question_sug_3,
          values.question_sug_4,
          values.correct_answer_code,
          serieid,
        ],
      );

      console.log("Question inserted successfully");
      setFileData([]); // Clear the file data after successful insert
      getQuestions();
      toast({
        title: "تمت اضافة السؤال بنجاح",
        duration: 1000,
        variant: "succ",
      });
    } catch (error) {
      console.error("Error inserting question:", error);
    }
  };

  const serieDeleteHandler = async () => {
    try {
      if (questions.length <= 0) {
        const db = await Database.load("sqlite:roadcode.db");
        await db.execute("DELETE FROM SERIES WHERE serie_id = $1", [serieid]);

        console.log("serie deleted");
      } else {
        console.log(
          "this serie has questions delete them first thene delete the serie",
        );
      }
    } catch (error) {
      console.error("somting went wrong : ", error);
    }
  };

  const serieUpdateHandler = async (
    description: string,
    serieCategory: string,
  ) => {
    const db = await Database.load("sqlite:roadcode.db");
    await db.execute(
      "UPDATE SERIES SET description = $1 , category = $2 WHERE serie_id = $3;",
      [description, serieCategory, serieid],
    );
    console.log("update series");
  };

  const serieResultUpdateHandler = async (
  ) => {
    const db = await Database.load("sqlite:roadcode.db");
    await db.execute(
      "UPDATE SERIES SET serie_result = $1 WHERE serie_id = $2;",
      [fileData[0], serieid],
    );
    console.log("update series");
  };

  const [serie, setSerie] = useState<SerieType | null>(null);

  const getSerieArray = async () => {
    const data = await getSerie();
    if (data) {
      setSerie(data);
    }
  };

  const getSerie = async () => {
    try {
      const db = await Database.load("sqlite:roadcode.db");
      const result = await db.select(
        "SELECT serie_id, description FROM SERIES WHERE serie_id = $1;",
        [serieid],
      );

      // Check if we got results
      if (Array.isArray(result) && result.length > 0) {
        return result[0] as SerieType; // Return the first result
      }
      return null;
    } catch (error) {
      console.error("Error fetching series data:", error);
      return null;
    }
  };

  const [questions, setQuestions] = useState<Question[]>([]);

  const getQuestions = async () => {
    try {
      const db = await Database.load("sqlite:roadcode.db");

      const result = await db.select(
        "SELECT * FROM Questions WHERE serie_id = $1;",
        [serieid],
      );

      if (Array.isArray(result)) {
        setQuestions(result);
        return result;
      }
    } catch (error) {
      console.error("Error details:", error);
      return [];
    }
  };

  const [showQuestion, setShowQuestions] = useState(false);

  // Use useEffect with proper dependency tracking
  useEffect(() => {
    const fetchData = async () => {
      await getSerieArray();
      await getQuestions();
    };

    fetchData();
  }, [serieid]); // Add serieid as dependency

  // Separate useEffect for monitoring questions state
  useEffect(() => {
    if (questions.length > 0) {
      setShowQuestions(true);
    } else {
      setShowQuestions(false);
    }
  }, [questions]); // Add questions as dependency

  const handleFileChange = async (e: any, field: any, setFileData: any) => {
    // console.log(typeof (e))
    // console.log(typeof (field))
    // console.log(typeof (setFileData))
    // console.log(e)
    // console.log(field)
    // console.log(setFileData)
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

  const [fileData, setFileData] = useState<any[]>([]);

  const [imageName, setImageName] = useState<string>("");
  const [questionName, setQuetionName] = useState<string>("");
  const [answerName, setAnswerName] = useState<string>("");
  const [videoName, setVideoName] = useState<string>("");

  const [questionAudioPath, setQuestionAudioPath] = useState<string>("");
  const [answerAudioPath, setAnswerAudioPath] = useState<string>("");
  const [questionImagePath, setQuestionImagePath] = useState<string>("");
  const [questionVideoPath, setQuestionVideoPath] = useState<string>("");

  const formClear = () => {

    form.reset()
    setImageName("");
    setQuetionName("");
    setAnswerName("");
    setVideoName("");

    setQuestionImagePath("");
    setAnswerAudioPath("");
    setQuestionAudioPath("");
    setQuestionVideoPath("");
  }


  // const copyFileToResources = async (any: zabi) => {

  //   /*
  //     the below code is for copying files to the resource folder
  //   */
  //   const random = Math.ceil(Math.random() * 1000000);
  //   const newFileName = `resources/${random}`
  //   const appConfigDirPath = await appConfigDir();
  //   if(zabi) {

  //   await copyFile(zabi, await join(appConfigDirPath, newFileName));
  //   }
  //   // console.log("File copied successfully!");
  //   // console.log(random);


  //   const fullPath = `${appConfigDirPath}/resources/${random}`;

  //   if (await exists(fullPath)) {
  //     // console.log("aaaaaaaa hwaaaa lik a zabi lah yahdik");
  //     console.log(fullPath)

  //   }

  //   return fullPath;
  // }


  // const copyFileToResources = async (filixx) => {
  //   /*
  //     The below code is for copying files to the resource folder
  //   */

  //   // Check if the source file exists
  //   if (!(await exists(filixx))) {
  //     console.error(`File not found: ${filixx}`);
  //     return;
  //   }

  //   const random = Math.ceil(Math.random() * 1000000);
  //   const appConfigDirPath = await appConfigDir();
  //   console.log("App Config Directory:", appConfigDirPath);

  //   const resourcesPath = await join(appConfigDirPath, "resources");

  //   // Ensure 'resources/' directory exists
  //   if (!(await exists(resourcesPath))) {
  //     await mkdir(resourcesPath);
  //   }

  //   const newFileName = `${random}`;
  //   const fullPath = await join(resourcesPath, newFileName);

  //   await copyFile(filixx, fullPath);
  //   console.log("File copied successfully!");

  //   if (await exists(fullPath)) {
  //     console.log("File available at:", fullPath);
  //     return fullPath;
  //   } else {
  //     console.error("Error: File not found after copying.");
  //   }
  // };

  const copyFileToResources = async (filixx) => {

    if (filixx != "") {

      if (!(await exists(filixx))) {
        console.error(`File not found: ${filixx}`);
        return null;
      }

      const random = Math.ceil(Math.random() * 1000000);
      const appConfigDirPath = await appConfigDir();
      const resourcesPath = await join(appConfigDirPath, "resources");

      if (!(await exists(resourcesPath))) {
        await mkdir(resourcesPath);
      }

      // Extract the file extension
      const fileExtension = await extname(filixx);
      const newFileName = `${random}.${fileExtension}`; // Retain the extension
      const fullPath = await join(resourcesPath, newFileName);

      await copyFile(filixx, fullPath);
      console.log("File copied successfully:", fullPath);

      return fullPath; // Now includes the correct extension
    } else {
      return "";
    }

  };

  const navigation = Route.useNavigate();
  const transformData = (serie: SerieType) => {
    return {
      serieName: serie?.description,
      serieCategory: serie?.category,
    };
  };

  useEffect(() => {
    if (serie) {
      serieForm.reset(transformData(serie));
    }
  }, [serie]);
  return (
    <div className="container mx-auto h-screen w-screen flex flex-col items-center py-4 gap-8 ">
      {/*Hello World {serieid}*/}
      <div className=" w-96 h-60 flex flex-col justify-center items-center gap-8 rounded-xl border p-4 ">
        <h1 className="text-3xl">{serie?.description}</h1>
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Pen className="text-green-700" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>تعديل السلسلة</DialogTitle>
              </DialogHeader>
              <div>
                <Form {...serieForm}>
                  <form onSubmit={serieForm.handleSubmit(onSubmitSerie)}>
                    <div className="flex flex-col justify-center items-center gap-6">
                      <FormField
                        control={serieForm.control}
                        name="serieName"
                        render={({ field }) => (
                          <FormItem className="w-60">
                            <FormLabel>اسم السلسلة</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={serieForm.control}
                        name="serieCategory"
                        render={({ field }) => (
                          <FormItem className="w-60">
                            <FormLabel>صنف السلسلة :</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختيار صنف السلسلة" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="A">A</SelectItem>
                                <SelectItem value="B">B</SelectItem>
                                <SelectItem value="C">C</SelectItem>
                                <SelectItem value="D">D</SelectItem>
                                <SelectItem value="E">E</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <Button type="submit">تعديل</Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>
                <Trash2 className="text-red-700" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-right">
                  هل انت متاكد
                </AlertDialogTitle>
                <AlertDialogDescription className="text-right">
                  هل حقا تريد حذف السلسلة
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>لا</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    let hasQuestions = questions.length <= 0 ? true : false;
                    if (hasQuestions) {
                      serieDeleteHandler();
                      navigation({ to: "/" });
                      toast({
                        title: "لقد تم حذف السلسلة بنجاح",
                        duration: 1000,
                        variant: "succ",
                      });
                    } else {
                      toast({
                        title: "انتباه",
                        description:
                          "لا يمكن حذف هذه السلسلة حتى تقوم بحذف الاسئلة",
                        duration: 1000,
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  نعم
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button>
            <Link to="/">
              <ArrowLeft />
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Pen className="text-green-700" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>تعديل السلسلة</DialogTitle>
              </DialogHeader>
              <div>
                <Form {...serieFormResult}>
                  <form onSubmit={serieFormResult.handleSubmit(onSubmitSerieResult)}>
                    <div className="flex flex-col justify-center items-center gap-6" dir="rtl" >
                      <FormField
                        control={serieFormResult.control}
                        name="serie_result"
                        render={({ field }) => (
                          <FormItem className="w-60">
                            <FormLabel>تصحيح السلسلة</FormLabel>
                            <FormControl>
                              <Input
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
                        <Button type="submit">تعديل</Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 grid-rows-auto py-6 w-full ">
        <div className="col-start-1 col-end-5 flex justify-between items-center text-right">
          <Drawer>
            <DrawerTrigger
              asChild
            >
              <Button>اضافة</Button>
            </DrawerTrigger>
            <DrawerContent className="h-screen grid justify-center text-right ">
              <DrawerTitle>اضافة سؤال جديد</DrawerTitle>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid grid-cols-2 gap-12"
                >
                  <div className="flex flex-col gap-6" dir="rtl">
                    <FormField
                      control={form.control}
                      name="question_2"
                      render={({ field }) => (
                        <FormItem className="w-60">
                          <FormLabel>السؤال رقم 2</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="question_sug_1"
                      render={({ field }) => (
                        <FormItem className="w-60">
                          <FormLabel>اجابة 1</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="question_sug_2"
                      render={({ field }) => (
                        <FormItem className="w-60">
                          <FormLabel>اجابة 2</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="question_sug_3"
                      render={({ field }) => (
                        <FormItem className="w-60">
                          <FormLabel>اجابة 3</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="question_sug_4"
                      render={({ field }) => (
                        <FormItem className="w-60">
                          <FormLabel>4 اجابة</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="correct_answer_code"
                      render={({ field }) => (
                        <FormItem className="w-60">
                          <FormLabel>
                            ارقام الاجوبة الصحيحة
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-6 " dir="rtl">
                    <FormField
                      control={form.control}
                      name="question_type"
                      render={({ field }) => (
                        <FormItem className="w-60">
                          <FormLabel>نوع السؤال</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختيار نوع السؤال" />
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
                      name="question_image"
                      render={({ field }) => (
                        <FormItem className="w-60">
                          <FormLabel>صورة السؤال</FormLabel>
                          {/*

                          <FormControl>
                            <Input
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
*/}
                          <div className="flex w-full max-w-sm items-center space-x-2 gap-4" >
                            <Button onClick={async (e) => {
                              e.preventDefault();
                              const file = await open({
                                multiple: false,
                                directory: false,
                              });
                              if (file) {
                                // console.log("path : ", file);
                                setQuestionImagePath(file);
                                setImageName(await basename(file));
                              }
                            }}>
                              <ImageUp />
                            </Button>
                            <Input type="text" placeholder="File Name" value={imageName} disabled dir="ltr" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="question_audio"
                      render={({ field }) => (
                        <FormItem className="w-60">
                          <FormLabel>
                            المقطع الصوتي - السؤال
                          </FormLabel>
                          <FormControl>
                            <div className="flex w-full max-w-sm items-center space-x-2 gap-4" >
                              <Button onClick={async (e) => {
                                e.preventDefault();
                                const file = await open({
                                  multiple: false,
                                  directory: false,
                                });
                                if (file) {
                                  // console.log("path : ", file);
                                  setQuestionAudioPath(file);
                                  setQuetionName(await basename(file));
                                }
                              }}>
                                <FileAudio />
                              </Button>
                              <Input type="text" placeholder="File Name" value={questionName} disabled dir="ltr" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="question_answer"
                      render={({ field }) => (
                        <FormItem className="w-60">
                          <FormLabel>
                            المقطع الصوتي - الاجابة
                          </FormLabel>
                          <FormControl>
                            <div className="flex w-full max-w-sm items-center space-x-2 gap-4" >
                              <Button onClick={async (e) => {
                                e.preventDefault();
                                const file = await open({
                                  multiple: false,
                                  directory: false,
                                });
                                if (file) {
                                  // console.log("path : ", file);
                                  setAnswerAudioPath(file);
                                  setAnswerName(await basename(file));
                                }
                              }}>
                                <FileAudio2 />
                              </Button>
                              <Input type="text" placeholder="File Name" value={answerName} disabled dir="ltr" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="question_video"
                      render={({ field }) => (
                        <FormItem className="w-60">
                          <FormLabel>
                            مقطع الفيديو
                          </FormLabel>
                          <FormControl>
                            <div className="flex w-full max-w-sm items-center space-x-2 gap-4" >
                              <Button onClick={async (e) => {
                                e.preventDefault();
                                const file = await open({
                                  multiple: false,
                                  directory: false,
                                });
                                if (file) {
                                  // console.log("path : ", file);
                                  setQuestionVideoPath(file);
                                  setVideoName(await basename(file));
                                }
                              }}>
                                <Clapperboard />
                              </Button>
                              <Input type="text" placeholder="File Name" value={videoName} disabled dir="ltr" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="question_1"
                      render={({ field }) => (
                        <FormItem className="w-60">
                          <FormLabel>السؤال رقم 1</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-start-1 col-end-3 flex justify-center items-center gap-4 h-1/6 ">
                    <DrawerClose asChild>
                      <Button onClick={() => {

                        formClear();
                      }}>
                        الغاء
                      </Button>
                    </DrawerClose>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        onClick={() => {
                        }}
                      >
                        تاكيد
                      </Button>
                    </div>
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        // form.reset();
                        formClear();
                      }}
                    >
                      تصحيح
                    </Button>
                  </div>
                </form>
              </Form>
            </DrawerContent>
          </Drawer>
          <h1 className="text-2xl font-bold ">لائحة الأسئلة</h1>
        </div>

        {showQuestion
          ? questions.map((question, index) => {
            return (
              <Card
                key={index}
                className="w-64 text-center flex flex-col justify-center items-center text-right"
                dir="rtl"
              >
                <CardHeader>
                  <CardTitle>السؤال {index + 1}</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="flex gap-4">
                    <Link
                      to={`/series/serie_details/question_details/${question.question_id}`}
                      params={{ questionid: `${question.question_id}` }}
                    >
                      <Eye className="text-green-700" />
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Trash2 className="text-red-700" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-right">
                            هل انت متأكد
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-right">
                            هل حقا تريد حدف السؤال رقم {index + 1}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>لا</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              questionDeleteHandler(question.question_id);
                              toast({
                                title: "تم حذف السؤال بنجاح",
                                duration: 1000,
                                variant: "succ",
                              });

                              getQuestions();
                            }}
                          >
                            نعم
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })
          : (
            <Card className="col-start-2 col-end-4" dir="rtl">
              <CardHeader>
                السلسلة فارغة
              </CardHeader>
              <CardContent>
                ليس هناك اي سؤال في هذه السلسلة
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
};

export const Route = createFileRoute("/series/serie_details/$serieid")({
  component: serieDetails,
});
