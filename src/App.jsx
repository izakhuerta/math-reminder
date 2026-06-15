import { useEffect, useMemo, useState } from "react";

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
  const [min, max] =
    getDifficultyRange(difficulty);

  switch (course) {
    case "Aritmética": {
      const a = rand(min, max);

      const b = rand(min, max);

      const operators = ["+", "-", "×"];

      const op =
        operators[rand(0, operators.length - 1)];

      let answer = 0;

      if (op === "+") {
        answer = a + b;
      }

      if (op === "-") {
        answer = a - b;
      }

      if (op === "×") {
        answer = a * b;
      }

      return {
        question: `${a} ${op} ${b}`,
        answer,
      };
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
        45: Number(
          (Math.sqrt(2) / 2).toFixed(2)
        ),
        60: Number(
          (Math.sqrt(3) / 2).toFixed(2)
        ),
      };
      return {
        question: `sin(${angle}°) aprox.`,
        answer: table[angle],
      };
    }
  }
}
   
  
    
     


export default function App() {
  const [stage, setStage] =
    useState("setup");

  const [course, setCourse] =
    useState("Aritmética");

  const [difficulty, setDifficulty] =
    useState("Fácil");

  const [numQ, setNumQ] =
    useState(5);

  const [mode, setMode] =
    useState("Normal");

  const [timeLeft, setTimeLeft] =
    useState(10);

  const [questions, setQuestions] =
    useState([]);

  const [current, setCurrent] =
    useState(0);

  const [input, setInput] =
    useState("");

  const [history, setHistory] =
    useState([]);

  const [points, setPoints] =
    useState(0);

  const [streak, setStreak] =
    useState(0);

  const [lastPlayed, setLastPlayed] =
    useState(null);

  const [combo, setCombo] =
    useState(0);

  const [bestCombo, setBestCombo] =
    useState(0);

  const [lives, setLives] =
    useState(3);

  const courses = [
    "Aritmética",
    "Álgebra",
    "Geometría",
     "Trigonometría",
  ];

  const difficulties = [
    "Fácil",
    "Media",
    "Difícil",
  ];

  useEffect(() => {
    const savedPoints = Number(
      localStorage.getItem("points") || 0
    );

    const savedStreak = Number(
      localStorage.getItem("streak") || 0
    );

    const savedLast =
      localStorage.getItem("lastPlayed");

    setPoints(savedPoints);

    setStreak(savedStreak);

    setLastPlayed(savedLast);
  }, []);

  useEffect(() => {
    if (stage !== "quiz") return;

    if (mode !== "Rápido") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submit(true);

          return 10;
        }

        return prev - 1;
      });
    }, 1000);

    return () =>
      clearInterval(interval);
  });

  function saveProgress(
    newPoints,
    newStreak
  ) {
    localStorage.setItem(
      "points",
      newPoints
    );

    localStorage.setItem(
      "streak",
      newStreak
    );

    localStorage.setItem(
      "lastPlayed",
      todayString()
    );
  }

  function createQuestions() {
    const used = new Set();

    const qs = [];

    while (qs.length < numQ) {
      const q = generateQuestion(
        course,
        difficulty
      );

      if (!used.has(q.question)) {
        used.add(q.question);

        qs.push(q);
      }
    }

    return qs;
  }

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

    if (mode === "Rápido") {
      setTimeLeft(10);
    }
  }

  function submit(force = false) {
    if (
      !force &&
      input.trim() === ""
    )
      return;

    const q = questions[current];

    const userAnswer = force
      ? NaN
      : parseFloat(input);

    const correct =
      Math.abs(
        userAnswer - q.answer
      ) < 0.01;

    let earned = 0;

    if (correct) {
      earned = 10 + combo * 2;

      setCombo((prev) => {
        const newCombo = prev + 1;

        setBestCombo((best) =>
          Math.max(best, newCombo)
        );

        return newCombo;
      });
    } else {
      earned = 2;

      setCombo(0);

      setLives((prev) => prev - 1);
    }

    const newPoints =
      points + earned;

    const today = todayString();

    const yesterday =
      yesterdayString();

    let newStreak = streak;

    if (lastPlayed !== today) {
      if (lastPlayed === yesterday) {
        newStreak = streak + 1;
      } else {
        newStreak = 1;
      }
    }

    setPoints(newPoints);

    setStreak(newStreak);

    setLastPlayed(today);

    saveProgress(
      newPoints,
      newStreak
    );

    setHistory((prev) => [
      ...prev,
      {
        q: q.question,
        userAnswer: force
          ? "Sin responder"
          : userAnswer,
        correctAnswer: q.answer,
        correct,
      },
    ]);

    setInput("");

    if (lives - (!correct ? 1 : 0) <= 0) {
      setStage("result");

      return;
    }

    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);

      if (mode === "Rápido") {
        setTimeLeft(10);
      }
    } else {
      setStage("result");
    }
  }

  function reset() {
    setStage("setup");

    setQuestions([]);

    setCurrent(0);

    setHistory([]);

    setInput("");
  }

  const correctCount =
    history.filter(
      (h) => h.correct
    ).length;

  const percentage =
    history.length > 0
      ? Math.round(
          (correctCount /
            history.length) *
            100
        )
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

          <p className="text-sm text-gray-600">
            Mejora tu velocidad y precisión
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm font-semibold">
          <div className="bg-yellow-200 px-3 py-2 rounded-2xl text-center">
            ⭐ {points} pts
          </div>

          <div className="bg-orange-200 px-3 py-2 rounded-2xl text-center">
            🔥 {streak} días
          </div>
        </div>

        {stage === "setup" && (
          <div className="space-y-4">
            {/* CURSO */}
            <div>
              <p className="font-semibold mb-2">
                📘 Curso
              </p>

              <div className="grid grid-cols-2 gap-2">
                {courses.map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      setCourse(c)
                    }
                    className={`p-3 rounded-2xl font-bold shadow transition active:scale-95 ${
                      course === c
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* DIFICULTAD */}
            <div>
              <p className="font-semibold mb-2">
                🎯 Dificultad
              </p>

              <div className="grid grid-cols-3 gap-2">
                {difficulties.map((d) => (
                  <button
                    key={d}
                    onClick={() =>
                      setDifficulty(d)
                    }
                    className={`p-3 rounded-2xl font-bold shadow ${
                      difficulty === d
                        ? "bg-green-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* MODO */}
            <div>
              <p className="font-semibold mb-2">
                ⚡ Modo
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  "Normal",
                  "Rápido",
                ].map((m) => (
                  <button
                    key={m}
                    onClick={() =>
                      setMode(m)
                    }
                    className={`p-3 rounded-2xl font-bold shadow ${
                      mode === m
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* PREGUNTAS */}
            <div>
              <p className="font-semibold mb-2">
                🔢 Preguntas
              </p>

              <select
                value={numQ}
                onChange={(e) =>
                  setNumQ(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="w-full p-3 rounded-2xl bg-gray-100 text-center font-bold"
              >
                {Array.from(
                  { length: 20 },
                  (_, i) => i + 1
                ).map((n) => (
                  <option
                    key={n}
                    value={n}
                  >
                    {n} preguntas
                  </option>
                ))}
              </select>
            </div>

            {/* START */}
            <button
              onClick={start}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 rounded-2xl shadow-lg active:scale-95"
            >
              🚀 Empezar
            </button>
          </div>
        )}

        {stage === "quiz" && (
          <div className="space-y-4 text-center">
            <h2 className="text-lg font-bold">
              Pregunta {current + 1} /{" "}
              {questions.length}
            </h2>

            {/* TIMER */}
            {mode === "Rápido" && (
              <div className="bg-red-100 text-red-600 font-bold py-2 rounded-2xl">
                ⏳ {timeLeft}s
              </div>
            )}

            {/* COMBO + VIDAS */}
            <div className="flex justify-between text-sm font-bold">
              <div className="bg-pink-100 px-3 py-2 rounded-xl">
                🔥 Combo: {combo}
              </div>

              <div className="bg-red-100 px-3 py-2 rounded-xl">
                ❤️ {lives}
              </div>
            </div>

            {/* BARRA */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-purple-600 h-3 transition-all duration-300"
                style={{
                  width: `${
                    ((current + 1) /
                      questions.length) *
                    100
                  }%`,
                }}
              />
            </div>

            {/* QUESTION */}
            <div className="bg-purple-100 p-5 rounded-2xl text-2xl font-bold shadow-inner">
              {
                questions[current]
                  ?.question
              }
            </div>

            {/* INPUT */}
            <input
              type="text"
              inputMode="decimal"
              value={input}
              onChange={(e) =>
                setInput(
                  e.target.value.replace(
                    /[^0-9.-]/g,
                    ""
                  )
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  submit();
                }
              }}
              className="w-full p-3 rounded-2xl bg-gray-100 text-center font-bold text-lg"
              placeholder="Tu respuesta"
            />

            {/* BUTTON */}
            <button
              disabled={!input}
              onClick={() =>
                submit()
              }
              className="w-full bg-blue-500 text-white py-3 rounded-2xl font-bold shadow-lg active:scale-95 disabled:opacity-50"
            >
              Siguiente ➡
            </button>
          </div>
        )}

        {stage === "result" && (
          <div className="space-y-4">
            {/* RESULTADOS */}
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-purple-700">
                🏆 Rango {rank}
              </h2>

              <p className="text-gray-600">
                {correctCount} /{" "}
                {history.length} correctas
              </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-2 text-sm font-bold">
              <div className="bg-green-100 p-3 rounded-2xl text-center">
                ✅ {percentage}%
              </div>

              <div className="bg-yellow-100 p-3 rounded-2xl text-center">
                🔥 Mejor combo:{" "}
                {bestCombo}
              </div>
            </div>

            {/* HISTORIAL */}
            <div className="max-h-60 overflow-auto space-y-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-gray-100 text-sm"
                >
                  <p className="font-bold">
                    {h.q}
                  </p>

                  <p>
                    Tu respuesta:{" "}
                    {h.userAnswer}
                  </p>

                  <p>
                    Correcta:{" "}
                    {h.correctAnswer}
                  </p>

                  <p
                    className={
                      h.correct
                        ? "text-green-600 font-bold"
                        : "text-red-500 font-bold"
                    }
                  >
                    {h.correct
                      ? "✔ Correcto"
                      : "✘ Incorrecto"}
                  </p>
                </div>
              ))}
            </div>

            {/* RESTART */}
            <button
              onClick={reset}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-2xl font-bold shadow-lg active:scale-95"
            >
              🔁 Jugar otra vez
            </button>
          </div>
        )}
      </div>
    </div>
  );
}