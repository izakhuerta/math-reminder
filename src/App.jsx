import { useEffect, useState } from "react";

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function todayString() {
  return new Date().toISOString().split("T")[0];
}

function generateQuestion(course) {
  switch (course) {
    case "Aritmética": {
      const a = rand(1, 20);
      const b = rand(1, 20);
      const op = Math.random() > 0.5 ? "+" : "-";
      const question = `${a} ${op} ${b}`;
      const answer = op === "+" ? a + b : a - b;
      return { question, answer };
    }

    case "Álgebra": {
      const a = rand(1, 10);
      const x = rand(1, 10);
      const b = a * x;
      return {
        question: `x en ${a}x = ${b}`,
        answer: x,
      };
    }

    case "Geometría": {
      const w = rand(2, 10);
      const h = rand(2, 10);
      return {
        question: `Área de rectángulo ${w} x ${h}`,
        answer: w * h,
      };
    }

    case "Trigonometría": {
      const angles = [30, 45, 60];
      const angle = angles[rand(0, 2)];
      const table = { 30: 0.5, 45: 0.71, 60: 0.87 };
      return {
        question: `sin(${angle}) (aprox 2 decimales)`,
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

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);

  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastPlayed, setLastPlayed] = useState(null);

  const courses = ["Aritmética", "Álgebra", "Geometría", "Trigonometría"];
  const difficulties = ["Fácil", "Media", "Difícil"];

  useEffect(() => {
    const savedPoints = Number(localStorage.getItem("points") || 0);
    const savedStreak = Number(localStorage.getItem("streak") || 0);
    const savedLast = localStorage.getItem("lastPlayed");

    setPoints(savedPoints);
    setStreak(savedStreak);
    setLastPlayed(savedLast);
  }, []);

  function saveProgress(newPoints, newStreak) {
    localStorage.setItem("points", newPoints);
    localStorage.setItem("streak", newStreak);
    localStorage.setItem("lastPlayed", todayString());
  }

  function start() {
    const qs = Array.from({ length: numQ }, () => generateQuestion(course));
    setQuestions(qs);
    setStage("quiz");
    setCurrent(0);
    setHistory([]);
  }

  function submit() {
    const q = questions[current];
    const userAnswer = parseFloat(input);
    const correct = Math.abs(userAnswer - q.answer) < 0.01;

    let newPoints = points + (correct ? 10 : 2);

    const today = todayString();
    let newStreak = streak;

    if (lastPlayed !== today) {
      newStreak = streak + 1;
      setLastPlayed(today);
    }

    setPoints(newPoints);
    setStreak(newStreak);
    saveProgress(newPoints, newStreak);

    setHistory([
      ...history,
      {
        q: q.question,
        userAnswer,
        correctAnswer: q.answer,
        correct,
      },
    ]);

    setInput("");

    if (current + 1 < questions.length) setCurrent(current + 1);
    else setStage("result");
  }

  function reset() {
    setStage("setup");
    setQuestions([]);
    setCurrent(0);
    setHistory([]);
  }

  const bg = "min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-400 flex items-center justify-center p-4";

  return (
    <div className={bg}>
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-3xl p-5 shadow-2xl">

        {/* HEADER */}
        <div className="text-center mb-3">
          <h1 className="text-2xl font-extrabold text-purple-700">📚 Math Express</h1>
          <p className="text-sm text-gray-600">Entrena rápido y mejora cada día</p>
        </div>

        {/* STATS */}
        <div className="flex justify-between mb-4 text-sm font-semibold">
          <span className="bg-yellow-200 px-3 py-1 rounded-full">⭐ {points} pts</span>
          <span className="bg-orange-200 px-3 py-1 rounded-full">🔥 {streak} días</span>
        </div>

        {stage === "setup" && (
          <div className="space-y-4">

            <div>
              <p className="font-semibold mb-2">📘 Curso</p>
              <div className="grid grid-cols-2 gap-2">
                {courses.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCourse(c)}
                    className={`p-3 rounded-2xl font-bold shadow transition active:scale-95 ${course === c ? "bg-purple-600 text-white" : "bg-gray-100"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-2">🎯 Dificultad</p>
              <div className="grid grid-cols-3 gap-2">
                {difficulties.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`p-3 rounded-2xl font-bold shadow ${difficulty === d ? "bg-green-500 text-white" : "bg-gray-100"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-2">🔢 Preguntas</p>
              <input
                type="number"
                value={numQ}
                onChange={(e) => setNumQ(Number(e.target.value))}
                className="w-full p-3 rounded-2xl bg-gray-100 text-center font-bold"
              />
            </div>

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
            <h2 className="text-lg font-bold">Pregunta {current + 1}</h2>

            <div className="bg-purple-100 p-5 rounded-2xl text-xl font-bold">
              {questions[current]?.question}
            </div>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-3 rounded-2xl bg-gray-100 text-center font-bold"
              placeholder="Tu respuesta"
            />

            <button
              onClick={submit}
              className="w-full bg-blue-500 text-white py-3 rounded-2xl font-bold shadow-lg active:scale-95"
            >
              Siguiente ➡
            </button>
          </div>
        )}

        {stage === "result" && (
          <div className="space-y-3">
            <h2 className="text-center font-bold text-lg">📊 Historial</h2>

            <div className="max-h-60 overflow-auto space-y-2">
              {history.map((h, i) => (
                <div key={i} className="p-3 rounded-2xl bg-gray-100 text-sm">
                  <p className="font-bold">{h.q}</p>
                  <p>Tu: {h.userAnswer}</p>
                  <p>Correcta: {h.correctAnswer}</p>
                  <p className={h.correct ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                    {h.correct ? "✔ Bien" : "✘ Mal"}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={reset}
              className="w-full bg-red-500 text-white py-3 rounded-2xl font-bold"
            >
              Reiniciar 🔁
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
