import { useWebSocket } from "../../contexts/WebSocketContext";
import { useRoleStore } from "../../store/roleStore";
import { Button, Box, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import Leaderboard from "../Leaderboard";
import { Player } from "../../types/types";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";

interface quickDrawWinner {
  restaurant: string;
  winnerUser: string;
  winnerScore: number;
}

const QuickDrawGame: React.FC = () => {
  const { socket } = useWebSocket();
  const role = useRoleStore((state) => state.role);
  const [gameStarted, setGameStarted] = useState(false);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [waitingForClick, setWaitingForClick] = useState(false);
  const [gameWinner, setGameWinner] = useState<quickDrawWinner>();
  const [playerScores, setPlayerScores] = useState<Player[]>();
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (socket) {
      //listen for when the game starts
      socket.on("quick-draw-started", () => {
        setGameStarted(true);
        startCountdown();
      });

      socket.on(
        "quick-draw-winner",
        (
          restaurant: string,
          winnerUser: string,
          winnerScore: number,
          playerScores: Player[]
        ) => {
          setGameWinner({ restaurant, winnerUser, winnerScore });
          setPlayerScores(playerScores);
        }
      );

      return () => {
        socket.off("quick-draw-started");
        socket.off("quick-draw-winner");
      };
    }
  }, [socket, navigate]);

  //host starts the game
  const startQuickDrawGame = () => {
    if (socket) {
      socket.emit("start-quick-draw");
    }
  };

  const startCountdown = () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown != null && prevCountdown > 0) {
          return prevCountdown - 1;
        } else {
          clearInterval(countdownInterval);
          setCountdown(null);
          triggerRandomDelay();
          return null;
        }
      });
    }, 1000);
  };

  const triggerRandomDelay = () => {
    const randomDelay = Math.random() * 3000 + 2000;
    setTimeout(() => {
      setStartTime(Date.now());
      setWaitingForClick(true);
    }, randomDelay);
  };

  //handle when player taps/reacts
  const handleReact = () => {
    if (startTime) {
      const reaction = Date.now() - startTime;
      setReactionTime(reaction);
      if (socket) {
        socket.emit("quick-draw-finished", reaction);
      }
      setWaitingForClick(false);
    }
  };

  useEffect(() => {
    if (gameWinner) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        debugger;
        socket?.emit("delete-session");
      }, 10000);
    }
  }, [gameWinner, socket]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: "300px" }}
    >
      {showConfetti && <Confetti />}

      {/* Only show the start button for the host */}
      {role === "host" && !gameStarted && (
        <Button
          variant="contained"
          onClick={startQuickDrawGame}
          sx={{
            padding: "16px 32px",
            backgroundColor: "#ff9800",
            fontSize: "18px",
            fontWeight: "bold",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            transition: "transform 0.2s",
            "&:hover": {
              backgroundColor: "#ffa726",
              transform: "scale(1.05)",
            },
          }}
        >
          Start Game
        </Button>
      )}

      {/* Show countdown */}
      {countdown !== null && (
        <Typography
          variant="h1"
          sx={{
            fontSize: "64px",
            color: "#ff1744",
            fontWeight: "bold",
            marginBottom: "20px",
            transition: "opacity 0.5s",
          }}
        >
          {countdown}
        </Typography>
      )}

      {/* Show waiting message */}
      {waitingForClick && !reactionTime && (
        <Typography variant="h6" sx={{ marginBottom: "20px", color: "#777" }}>
          Get ready to react...
        </Typography>
      )}

      {/* Show the reaction button once the game starts after the random delay */}
      {waitingForClick && (
        <Button
          variant="contained"
          onClick={handleReact}
          sx={{
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            backgroundColor: "#ff1744",
            color: "#fff",
            fontSize: "24px",
            fontWeight: "bold",
            boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)",
            transition: "transform 0.3s",
            "&:hover": {
              backgroundColor: "#ff4569",
              transform: "scale(1.05)",
            },
          }}
        >
          CLICK!
        </Button>
      )}

      {/* Show the player's reaction time */}
      {reactionTime && (
        <Typography
          variant="h6"
          sx={{ color: "#333", marginTop: "20px", fontWeight: "normal" }}
        >
          Your reaction time: {reactionTime} ms
        </Typography>
      )}
      {gameWinner && playerScores && (
        <>
          <Typography
            variant="h6"
            sx={{
              color: "#333",
              marginTop: "20px",
              marginBottom: "20px",
              fontWeight: "normal",
            }}
          >
            {gameWinner.winnerUser} has won with a time of{" "}
            {gameWinner.winnerScore} ms. Their selected restaurant is:{" "}
            <span style={{ fontWeight: "bold" }}>{gameWinner.restaurant}</span>
            This room will now close momentarily...
          </Typography>
          <Leaderboard scores={playerScores} />
        </>
      )}
    </Box>
  );
};

export default QuickDrawGame;
