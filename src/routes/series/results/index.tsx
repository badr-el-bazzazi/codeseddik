import { ResultContext } from "@/components/ResultProvider";
import { createFileRoute } from "@tanstack/react-router";
import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Card,  CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import Database from "@tauri-apps/plugin-sql";
import { ArrowLeft } from "lucide-react";

function ResultIndex() {
  const { resultContext, setResultContext } = useContext(ResultContext);

  const navigate = useNavigate();

  const [total, setTotal] = useState(0);

  const [questionId, setQuestionId] = useState(0);


  const [serieName , setSerieName ] = useState("");

  interface resultType {
    questionId : number;
    correct :boolean;
  }

  useEffect(() => {
    let count = 0;
    resultContext?.forEach((item :resultType) => {
      if (item.correct === true) {
        count++;
      }
        setQuestionId(item.questionId);
    });
    setTotal(count);

    return () => {
      setTotal(0);
    };
  }, [resultContext]);

  const getSerieName = async () => {
    try {
      const db = await Database.load("sqlite:roadcode.db");
      const name = await db.select(
        "SELECT S.description FROM series S JOIN QUESTIONS Q ON S.serie_id = Q.serie_id WHERE Q.question_id = $1 ;",
        [questionId],
      );

      if (Array.isArray(name) && name.length > 0) {
        
        // console.log(name);
        setSerieName(name[0].description)
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
    }

    fetchSerieName();
    // getSerieName();
  }, [questionId]);


  return (
    <div className="container mx-auto  flex flex-col gap-8  justify-center items-center ">
      <div className=" w-96 h-60 flex flex-col justify-center items-center gap-8 rounded-xl border p-4 ">
        <h1 className="text-3xl">{serieName}</h1>
        <div
          className={`w-40 h-40 ${
            total >= 32 ? "bg-green-700 " : "bg-red-700"
          } rounded-full flex items-center justify-center text-white text-2xl`}
        >
          {total} / 40
        </div>
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
      </div>
      <div className="grid grid-cols-4 justify-center items-center gap-8  w-full ">
        {resultContext?.map((item, index) => {
          return (
            <Link
              to={`/series/results/${item.questionId}`}
              key={item.questionId}
              dir="rtl"
              className="cursor-pointer"
            >
              <Card
                className={`${
                  item.correct ? "bg-green-700" : "bg-red-700"
                } text-white text-center`}
              >
                <CardHeader>
                  <CardTitle>
                    السؤال {index + 1}
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
export const Route = createFileRoute("/series/results/")({
  component: ResultIndex,
});
