import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import logo from "../assets/logo1.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContext, useState } from "react";
import { platform } from "@tauri-apps/plugin-os";
import Database from "@tauri-apps/plugin-sql";
import { useEffect } from "react";
import { Eye, FileDown, FileUp } from "lucide-react";
import { ResultContext } from "@/components/ResultProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { copyFile, exists, remove } from "@tauri-apps/plugin-fs";
import { useToast } from "@/hooks/use-toast";
import { BaseDirectory } from "@tauri-apps/api/path";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  component: Index,
});

const formSchema = z.object({
  username: z.string().min(1, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(1, {
    message: "the password must have at least 8 characters",
  }),
});
const serieFormSchema = z.object({
  serieName: z.string(),
  serieCategory: z.string(),
});

function Index() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const serieForm = useForm<z.infer<typeof serieFormSchema>>({
    resolver: zodResolver(serieFormSchema),
    defaultValues: {
      serieName: "",
      serieCategory: "",
    },
  });
  const [showControles, setShowControles] = useState(false);

  const [series, setSeries] = useState<any[]>([]);
  const { toast } = useToast();

  const [seriesEmpty, setSeriesEmpty] = useState(false);

  useEffect(() => {
    if (series.length > 0) {
      setSeriesEmpty(false);
    } else {
      setSeriesEmpty(true);
    }
  }, [series]);

  const { mode, setMode } = useContext(ResultContext);

  const dbExportWindows = async () => {
    const mainDB = await exists("roadcode.db", {
      baseDir: BaseDirectory.AppLocalData,
    });
    const walDB = await exists("roadcode.db-wal", {
      baseDir: BaseDirectory.AppLocalData,
    });
    const shDB = await exists("roadcode.db-shm", {
      baseDir: BaseDirectory.AppLocalData,
    });

    if (mainDB && walDB && shDB) {
      await copyFile("roadcode.db", "roadcode.db", {
        fromPathBaseDir: BaseDirectory.AppLocalData,
        toPathBaseDir: BaseDirectory.Desktop,
      });

      await copyFile("roadcode.db-shm", "roadcode.db-shm", {
        fromPathBaseDir: BaseDirectory.AppLocalData,
        toPathBaseDir: BaseDirectory.Desktop,
      });

      await copyFile("roadcode.db-wal", "roadcode.db-wal", {
        fromPathBaseDir: BaseDirectory.AppLocalData,
        toPathBaseDir: BaseDirectory.Desktop,
      });

      console.log("database exported");
    }
  };

  const handleExport = async () => {
    if (platform() === "linux") {
      const mainDB = await exists("roadcode.db", {
        baseDir: BaseDirectory.AppConfig,
      });
      const walDB = await exists("roadcode.db-wal", {
        baseDir: BaseDirectory.AppConfig,
      });
      const shDB = await exists("roadcode.db-shm", {
        baseDir: BaseDirectory.AppConfig,
      });

      if (mainDB && walDB && shDB) {
        await copyFile("roadcode.db", "roadcode.db", {
          fromPathBaseDir: BaseDirectory.AppConfig,
          toPathBaseDir: BaseDirectory.Desktop,
        });

        await copyFile("roadcode.db-shm", "roadcode.db-shm", {
          fromPathBaseDir: BaseDirectory.AppConfig,
          toPathBaseDir: BaseDirectory.Desktop,
        });

        await copyFile("roadcode.db-wal", "roadcode.db-wal", {
          fromPathBaseDir: BaseDirectory.AppConfig,
          toPathBaseDir: BaseDirectory.Desktop,
        });

        toast({
          variant: "succ",
          title: " لقد تم تصدير قاعدة البيانات بنجاح",
          duration: 1000,
        });
      }
    } else {
      dbExportWindows();
      toast({
        variant: "succ",
        title: " لقد تم تصدير قاعدة البيانات بنجاح",
        duration: 1000,
      });
    }
  };

  const dbImportWindows = async () => {
    const mainDB = await exists("roadcode.db", {
      baseDir: BaseDirectory.AppLocalData,
    });
    const walDB = await exists("roadcode.db-wal", {
      baseDir: BaseDirectory.AppLocalData,
    });
    const shDB = await exists("roadcode.db-shm", {
      baseDir: BaseDirectory.AppLocalData,
    });

    if (mainDB && walDB && shDB) {
      await remove("roadcode.db", { baseDir: BaseDirectory.AppLocalData });
      await remove("roadcode.db-wal", { baseDir: BaseDirectory.AppLocalData });
      await remove("roadcode.db-shm", { baseDir: BaseDirectory.AppLocalData });
      console.log("db is removed");

      await copyFile("roadcode.db", "roadcode.db", {
        fromPathBaseDir: BaseDirectory.Desktop,
        toPathBaseDir: BaseDirectory.AppLocalData,
      });
      await copyFile("roadcode.db-wal", "roadcode.db-wal", {
        fromPathBaseDir: BaseDirectory.Desktop,
        toPathBaseDir: BaseDirectory.AppLocalData,
      });
      await copyFile("roadcode.db-shm", "roadcode.db-shm", {
        fromPathBaseDir: BaseDirectory.Desktop,
        toPathBaseDir: BaseDirectory.AppLocalData,
      });

      console.log("database imported");
      await remove("roadcode.db", { baseDir: BaseDirectory.Desktop });
      await remove("roadcode.db-shm", { baseDir: BaseDirectory.Desktop });
      await remove("roadcode.db-wal", { baseDir: BaseDirectory.Desktop });
    }
  };

  const handleImport = async () => {
    if (platform() === "linux") {
      const mainDB = await exists("roadcode.db", {
        baseDir: BaseDirectory.AppConfig,
      });
      const walDB = await exists("roadcode.db-wal", {
        baseDir: BaseDirectory.AppConfig,
      });
      const shDB = await exists("roadcode.db-shm", {
        baseDir: BaseDirectory.AppConfig,
      });

      if (mainDB && walDB && shDB) {
        await remove("roadcode.db", { baseDir: BaseDirectory.AppConfig });
        await remove("roadcode.db-wal", { baseDir: BaseDirectory.AppConfig });
        await remove("roadcode.db-shm", { baseDir: BaseDirectory.AppConfig });
        console.log("db is removed");

        await copyFile("roadcode.db", "roadcode.db", {
          fromPathBaseDir: BaseDirectory.Desktop,
          toPathBaseDir: BaseDirectory.AppConfig,
        });
        await copyFile("roadcode.db-wal", "roadcode.db-wal", {
          fromPathBaseDir: BaseDirectory.Desktop,
          toPathBaseDir: BaseDirectory.AppConfig,
        });
        await copyFile("roadcode.db-shm", "roadcode.db-shm", {
          fromPathBaseDir: BaseDirectory.Desktop,
          toPathBaseDir: BaseDirectory.AppConfig,
        });

        await remove("roadcode.db", { baseDir: BaseDirectory.Desktop });
        await remove("roadcode.db-shm", { baseDir: BaseDirectory.Desktop });
        await remove("roadcode.db-wal", { baseDir: BaseDirectory.Desktop });
        toast({
          variant: "succ",
          title: " لقد تم استيراد قاعدة البيانات بنجاح",
          duration: 1000,
        });
      }
    } else {
      dbImportWindows();
      toast({
        variant: "succ",
        title: " لقد تم استيراد قاعدة البيانات بنجاح",
        duration: 1000,
      });
    }
  };

  const [category, setCategory] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (
      values.username === "a" &&
      values.password === "a"
    ) {
      setShowControles(true);
      toast({
        variant: "succ",
        title: "تم تسجيل دخولك بنجاح",
        duration: 1000,
      });
    } else {
      toast({
        variant: "destructive",
        title: "اسم المستخدم او كلمة المرور غير صحيحة",
        duration: 1000,
      });
    }
  };

  const onSubmitSerie = (values: z.infer<typeof serieFormSchema>) => {
    serieInsert(values.serieName, values.serieCategory);
  };

  const serieInsert = async (
    serie_description: string,
    serie_category: string,
  ) => {
    const db = await Database.load("sqlite:roadcode.db");
    await db.execute(
      "INSERT INTO SERIES (description, category) VALUES(?, ?)",
      [serie_description, serie_category],
    );
    // await refreshSeriesData(currentPage, itemsPerPage, category);

    console.log("Insert done");
    await refreshSeriesData(currentPage, itemsPerPage, category);
    toast({
      variant: "succ",
      title: "تمت اضافة السلسلة بنجاح",
      duration: 1000,
    });
  };

  const refreshSeriesData = async (
    page: number,
    limit: number,
    category?: string,
  ) => {
    const total = await getTotalCountByCategory(category || "");
    setTotalItems(total);
    const data = await getSeries(page, limit, category || "");
    setSeries(data);
  };

  useEffect(() => {
    const loadData = async () => {
      await refreshSeriesData(currentPage, itemsPerPage, category);
    };
    loadData();
  }, [currentPage, itemsPerPage, category]);

  const getTotalCountByCategory = async (category: string) => {
    try {
      const db = await Database.load("sqlite:roadcode.db");
      let query = "SELECT COUNT(*) as count FROM SERIES";
      const params: any[] = [];

      if (category) {
        query += " WHERE category = ?";
        params.push(category);
      }

      const result = await db.select(query, params);
      return result[0].count;
    } catch (error) {
      console.error("Error fetching total count:", error);
      return 0;
    }
  };

  const getSeries = async (
    page: number,
    limit: number,
    category?: string,
  ) => {
    try {
      const offset = (page - 1) * limit;
      const db = await Database.load("sqlite:roadcode.db");

      let query = "SELECT * FROM SERIES";
      const params: any[] = [];

      if (category) {
        query += " WHERE category = ?";
        params.push(category);
      }

      query += " LIMIT ? OFFSET ?";
      params.push(limit, offset);

      const result = await db.select(query, params);

      if (Array.isArray(result) && result.length > 0) {
        setSeriesEmpty(false);
        return result;
      } else {
        setSeriesEmpty(true);
        return [];
      }
    } catch (error) {
      console.error("Error fetching series data:", error);
      setSeriesEmpty(true);
      return [];
    }
  };

  const searchByCategory = async (
    category: string,
    page: number,
    limit: number,
  ) => {
    setCategory(category);
    await refreshSeriesData(page, limit, category);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }
    return [...new Set(pages)];
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <section className="container mx-auto flex flex-col gap-6">
        <div className={"w-full flex justify-end items-center h-12 "}>
          {showControles
            ? (
              <Button
                onClick={() => {
                  setShowControles(false);
                  form.reset();
                }}
              >
                تسجيل الخروج
              </Button>
            )
            : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    تسجيل الدخول
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>
                      تسجيل الدخول
                    </DialogTitle>
                  </DialogHeader>
                  <div>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col justify-center items-center gap-6">
                          <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem className="w-60">
                                <FormLabel>
                                  اسم المستخدم
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="w-60">
                                <FormLabel>
                                  كلمة المرور
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="space-y-2">
                            <Button type="submit">
                              تأكيد
                            </Button>
                          </div>
                        </div>
                      </form>
                    </Form>
                  </div>
                </DialogContent>
              </Dialog>
            )}
        </div>
        <div className="flex flex-col justify-center items-center">
          <img
            src={logo}
            alt="logo"
          />
        </div>

        {/* add new serie */}

        <div className="w-full flex justify-between items-center">
          {showControles
            ? (
              <div className="flex justify-center items-center gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      سلسلة جديدة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        اضافة سلسلة جديدة
                      </DialogTitle>
                    </DialogHeader>
                    <div dir="rtl">
                      <Form {...serieForm}>
                        <form onSubmit={serieForm.handleSubmit(onSubmitSerie)}>
                          <div className="flex flex-col justify-center items-center gap-6">
                            <FormField
                              control={serieForm.control}
                              name="serieName"
                              render={({ field }) => (
                                <FormItem className="w-60">
                                  <FormLabel>
                                    اسم السلسلة
                                  </FormLabel>
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
                                    defaultValue={field.value}
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
                              <Button type="submit">
                                تأكيد
                              </Button>
                            </div>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={() => {
                    handleImport();
                  }}
                >
                  <FileUp />
                </Button>
                <Button
                  onClick={() => {
                    handleExport();
                  }}
                >
                  <FileDown />
                </Button>
              </div>
            )
            : null}

          <div dir="rtl" className="flex flex-col gap-2">
            <p>الاصناف :</p>
            <Select
              onValueChange={(e) => {
                setCategory(e);
                searchByCategory(e, currentPage, 10);
              }}
              dir="rtl"
            >
              <SelectTrigger>
                <SelectValue placeholder="اختيار الصنف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">
                  صنف A
                </SelectItem>
                <SelectItem value="B">
                  صنف B
                </SelectItem>
                <SelectItem value="C">
                  صنف C
                </SelectItem>
                <SelectItem value="D">
                  صنف D
                </SelectItem>
                <SelectItem value="E">
                  صنف E
                </SelectItem>
                <SelectItem value="cours">
                  الدروس - cours
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div dir="rtl" className="flex flex-col gap-2">
            <p>
              الوضع :
              {mode == "learning" ? <span>تعلم</span> : <span>الامتحان</span>}
            </p>
            <Select
              onValueChange={(e) => {
                setMode(e);
              }}
              dir="rtl"
            >
              <SelectTrigger>
                <SelectValue placeholder="اختيار الوضع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="learning">
                  تعلم
                </SelectItem>
                <SelectItem value="examen">
                  الامتحان
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* SERIES LIST */}

        <div className="grid grid-cols-3 gap-6 ">
          {!seriesEmpty
            ? (series.map((serie) => {
              return (
                <Card
                  className="cursor-pointer flex items-center "
                  key={serie.serie_id}
                >
                  <Link
                    to={`/series/${serie.serie_id}`}
                    params={{ serieid: `${serie.serie_id}` }}
                    className={`w-full ${showControles ? "" : "text-center"}`}
                  >
                    <CardHeader>
                      <CardTitle>{serie.description}</CardTitle>
                    </CardHeader>
                  </Link>

                  {showControles
                    ? (
                      <div className="p-6">
                        <Link
                          to={`/series/serie_details/${serie.serie_id}`}
                          params={{ serieid: `${serie.serie_id}` }}
                        >
                          <Eye />
                        </Link>
                      </div>
                    )
                    : null}
                </Card>
              );
            }))
            : (
              <Card className="col-start-2 col-end-3" dir="rtl">
                <CardHeader>
                  <CardTitle>
                    الصنف {category} فارغ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  ليس هناك اي سلسلة تابعة ل الصنف {category}
                </CardContent>
              </Card>
            )}
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"}
              />
            </PaginationItem>

            {getPageNumbers().map((pageNumber, index) => (
              <PaginationItem key={index}>
                {pageNumber === "..." ? <PaginationEllipsis /> : (
                  <PaginationLink
                    isActive={currentPage === pageNumber}
                    onClick={() => setCurrentPage(Number(pageNumber))}
                    className="cursor-pointer"
                  >
                    {pageNumber}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>
    </ThemeProvider>
  );
}
