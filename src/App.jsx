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

  // Load saved data
  useEffect(() => {
    const savedPoints = Number(localStorage.getItem("points") || 0);
    const savedStreak = Number(localStorage.getItem("streak") || 0);
    const savedLast = localStorage.getItem("lastPlayed");

    setPoints(savedPoints);
    setStreak(savedStreak);
    setLastPlayed(savedLast);

    // streak logic
    const today = todayString();
    if (savedLast === today) {
      // already played today
    } else if (savedLast) {
      const last = new Date(savedLast);
      const diff = Math.floor((new Date(today) - last) / (1000 * 60 * 60 * 24));
      if (diff === 1) setStreak(savedStreak + 1);
      else if (diff > 1) setStreak(0);
    }
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

    let newPoints = points;

    if (correct) newPoints += 10;
    else newPoints += 2; // participación

    setPoints(newPoints);

    const today = todayString();
    let newStreak = streak;

    if (lastPlayed !== today) {
      newStreak = streak + 1;
      setLastPlayed(today);
    }

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

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 rounded-2xl p-5 shadow-xl">

        {/* TOP STATS */}
        <div className="flex justify-between text-xs text-zinc-400 mb-3">
          <span>⭐ Puntos: {points}</span>
          <span>🔥 Racha: {streak}</span>
        </div>

        {stage === "setup" && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-center">Math Express 🚀</h1>

            <div>
              <p className="text-sm mb-2">Curso</p>
              <div className="grid grid-cols-2 gap-2">
                {courses.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCourse(c)}
                    className={`p-2 rounded-xl text-sm ${course === c ? "bg-blue-500" : "bg-zinc-800"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm mb-2">Dificultad</p>
              <div className="grid grid-cols-3 gap-2">
                {difficulties.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`p-2 rounded-xl text-sm ${difficulty === d ? "bg-green-500" : "bg-zinc-800"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm mb-2">Número de preguntas</p>
              <input
                type="number"
                value={numQ}
                onChange={(e) => setNumQ(Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-zinc-800"
                min={1}
                max={20}
              />
            </div>

            <button onClick={start} className="w-full bg-white text-black py-2 rounded-xl">
              Empezar
            </button>
          </div>
        )}

        {stage === "quiz" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-center">Pregunta {current + 1}</h2>

            <div className="bg-zinc-800 p-4 rounded-xl text-center">
              {questions[current]?.question}
            </div>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-2 rounded-xl bg-zinc-800"
              placeholder="Tu respuesta"
            />

            <button onClick={submit} className="w-full bg-blue-500 py-2 rounded-xl">
              Siguiente
            </button>
          </div>
        )}

        {stage === "result" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-center">Historial</h2>

            <div className="max-h-60 overflow-auto space-y-2">
              {history.map((h, i) => (
                <div key={i} className="p-2 bg-zinc-800 rounded-xl text-sm">
                  <p>{h.q}</p>
                  <p>Tu respuesta: {h.userAnswer}</p>
                  <p>Correcta: {h.correctAnswer}</p>
                  <p className={h.correct ? "text-green-400" : "text-red-400"}>
                    {h.correct ? "✔ Bien" : "✘ Mal"}
                  </p>
                </div>
              ))}
            </div>

            <button onClick={reset} className="w-full bg-red-500 py-2 rounded-xl">
              Reiniciar
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
