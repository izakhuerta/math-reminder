import { useState } from "react";

export default function App() {
  const [answer, setAnswer] = useState("");
  const [points, setPoints] = useState(0);
  const [message, setMessage] = useState("");

  const correctAnswer = "56";

  const checkAnswer = () => {
    if (answer === correctAnswer) {
      setMessage("✅ ¡Correcto!");
      setPoints(points + 10);
    } else {
      setMessage("❌ Incorrecto, intenta otra vez");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.phone}>
        <h1>📱 Math Reminder</h1>

        <h2>🔥 Puntos: {points}</h2>

        <div style={styles.challenge}>
          <h3>🧠 Reto Diario</h3>

          <p>¿Cuánto es 8 × 7?</p>

          <input
            type="text"
            placeholder="Tu respuesta"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={styles.input}
          />

          <button onClick={checkAnswer} style={styles.button}>
            Verificar
          </button>

          <p>{message}</p>
        </div>

        <div style={styles.tip}>
          <h3>💡 Consejo Matemático</h3>

          <p>
            Practicar matemáticas 15 minutos al día mejora el aprendizaje.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#e5e7eb",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  phone: {
    backgroundColor: "white",
    width: "350px",
    padding: "30px",
    borderRadius: "30px",
    textAlign: "center",
    boxShadow: "0px 10px 25px rgba(0,0,0,0.2)",
  },

  challenge: {
    marginTop: "20px",
    backgroundColor: "#f3f4f6",
    padding: "20px",
    borderRadius: "20px",
  },

  input: {
    marginTop: "10px",
    padding: "10px",
    width: "80%",
    borderRadius: "10px",
    border: "1px solid gray",
  },

  button: {
    marginTop: "15px",
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "black",
    color: "white",
    cursor: "pointer",
  },

  tip: {
    marginTop: "20px",
    backgroundColor: "#dbeafe",
    padding: "15px",
    borderRadius: "20px",
  },
};