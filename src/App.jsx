import { useEffect, useMemo, useState, useCallback } from "react";

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function todayString() {
  return new Date().toISOString().split("T")[0];
}

function yesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function getDifficultyRange(difficulty) {
  switch (difficulty) {
    case "Fácil":
      return [1, 10];
    case "Media":
      return [10, 50];
    case "Difícil":
      return [50, 200];
    default:
      return [1, 10];
  }
}

function generateQuestion(course, difficulty) {
  const [min, max] = getDifficultyRange(difficulty);

  switch (course) {
    case "Aritmética": {
      const a = rand(min, max);
      const b = rand(min, max);
      const operators = ["+", "-", "×"];
      const op = operators[rand(0, operators.length - 1)];

      let answer = 0;

      if (op === "+") answer = a + b;
      if (op === "-") answer = a - b;
      if (op === "×") answer = a * b;

      return { question: `${a} ${op} ${b}`, answer };
    }

    case "Álgebra": {
      const x = rand(min, max);
      const a = rand(1, 20);
      const b = a * x;

      return {
        question: `Resolver: ${a}x = ${b}`,
        answer: x,
      };
    }

    case "Geometría": {
      const w = rand(min, max);
      const h = rand(min, max);

      return {
        question: `Área de rectángulo ${w} × ${h}`,
        answer: w * h,
      };
    }

    case "Trigonometría": {
      const angles = [30, 45, 60];
      const angle = angles[rand(0, angles.length - 1)];

      const table = {
        30: 0.5,
        45: Math.sqrt(2) / 2,
        60: Math.sqrt(3) / 2,
      };

      return {
        question: `sin(${angle}°) aprox.`,
        answer: table[angle],
      };
    }

    default:
      return { question: "1 + 1", answer: 2 };
  }
}

export default function App() {
  const [stage, setStage] = useState("setup");
  const [course, setCourse] = useState("Aritmética");
  const [difficulty, setDifficulty] = useState("Fácil");
  const [numQ, setNumQ] = useState(5);
  const [mode, setMode] = useState("Normal");

  const [timeLeft, setTimeLeft] = useState(10);

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");

  const [history, setHistory] = useState([]);

  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastPlayed, setLastPlayed] = useState(null);

  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);

  const [lives, setLives] = useState(3);

  const courses = ["Aritmética", "Álgebra", "Geometría", "Trigonometría"];
  const difficulties = ["Fácil", "Media", "Difícil"];

  // LOAD DATA
  useEffect(() => {
    setPoints(Number(localStorage.getItem("points") || 0));
    setStreak(Number(localStorage.getItem("streak") || 0));
    setLastPlayed(localStorage.getItem("lastPlayed"));
  }, []);

  function saveProgress(newPoints, newStreak) {
    localStorage.setItem("points", newPoints);
    localStorage.setItem("streak", newStreak);
    localStorage.setItem("lastPlayed", todayString());
  }

  function createQuestions() {
    const used = new Set();
    const qs = [];
    let attempts = 0;

    while (qs.length < numQ && attempts < 1000) {
      const q = generateQuestion(course, difficulty);
      if (!used.has(q.question)) {
        used.add(q.question);
        qs.push(q);
      }
      attempts++;
    }

    return qs;
  }

  const submit = useCallback(
    (force = false) => {
      if (!force && input.trim() === "") return;

      const q = questions[current];
      if (!q) return;

      const userAnswer = force ? null : Number(input);

      const correct =
        userAnswer !== null &&
        Math.abs(userAnswer - q.answer) < 0.01;

      let earned = 0;

      if (correct) {
        earned = 10 + combo * 2;

        setCombo((prev) => {
          const newCombo = prev + 1;
          setBestCombo((b) => Math.max(b, newCombo));
          return newCombo;
        });
      } else {
        earned = 2;
        setCombo(0);
      }

      setPoints((prev) => prev + earned);

      const today = todayString();
      const yesterday = yesterdayString();

      setStreak((prev) => {
        let newStreak = prev;

        if (lastPlayed !== today) {
          newStreak = lastPlayed === yesterday ? prev + 1 : 1;
        }

        setLastPlayed(today);
        saveProgress(points + earned, newStreak);

        return newStreak;
      });

      setHistory((prev) => [
        ...prev,
        {
          q: q.question,
          userAnswer: force ? "Sin responder" : userAnswer,
          correctAnswer: q.answer,
          correct,
        },
      ]);

      setInput("");

      setLives((prev) => {
        const newLives = correct ? prev : prev - 1;

        if (newLives <= 0) {
          setStage("result");
        }

        return newLives;
      });

      if (current + 1 < questions.length) {
        setCurrent((prev) => prev + 1);
        if (mode === "Rápido") setTimeLeft(10);
      } else {
        setStage("result");
      }
    },
    [input, questions, current, combo, lastPlayed, mode]
  );

  // TIMER FIXED
  useEffect(() => {
    if (stage !== "quiz" || mode !== "Rápido") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submit(true);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, mode, submit]);

  function start() {
    const qs = createQuestions();

    setQuestions(qs);
    setStage("quiz");
    setCurrent(0);
    setHistory([]);
    setInput("");
    setCombo(0);
    setBestCombo(0);
    setLives(3);
    setTimeLeft(10);
  }

  function reset() {
    setStage("setup");
    setQuestions([]);
    setCurrent(0);
    setHistory([]);
    setInput("");
  }

  const correctCount = history.filter((h) => h.correct).length;

  const percentage =
    history.length > 0
      ? Math.round((correctCount / history.length) * 100)
      : 0;

  const rank = useMemo(() => {
    if (percentage >= 95) return "S";
    if (percentage >= 85) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 50) return "C";
    return "D";
  }, [percentage]);

  const bg =
    "min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-400 flex items-center justify-center p-4";

  return (
    <div className={bg}>
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-3xl p-5 shadow-2xl">

        {/* HEADER */}
        <div className="text-center mb-3">
          <h1 className="text-3xl font-extrabold text-purple-700">
            📚 Math Express
          </h1>
        </div>

        {/* SETUP */}
        {stage === "setup" && (
          <div>
            <button onClick={start} className="w-full bg-purple-600 text-white p-3 rounded-xl">
              Empezar
            </button>
          </div>
        )}

        {/* QUIZ */}
        {stage === "quiz" && (
          <div className="space-y-4 text-center">
            <h2>
              {current + 1} / {questions.length}
            </h2>

            <div className="text-2xl font-bold">
              {questions[current]?.question}
            </div>

            <input
              value={input}
              onChange={(e) =>
                setInput(e.target.value.replace(/[^0-9.-]/g, ""))
              }
              className="w-full p-2 text-center"
            />

            <button
              onClick={() => submit()}
              className="w-full bg-blue-500 text-white p-3 rounded-xl"
            >
              Siguiente
            </button>
          </div>
        )}

        {/* RESULT */}
        {stage === "result" && (
          <div className="text-center">
            <h2>Rango {rank}</h2>
            <p>{correctCount} / {history.length}</p>
            <button onClick={reset} className="w-full bg-red-500 text-white p-3 rounded-xl">
              Reiniciar
            </button>
          </div>
        )}

      </div>
    </div>
  );
}