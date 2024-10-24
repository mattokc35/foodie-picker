import { useWebSocket } from "../../contexts/WebSocketContext";
import { useRoleStore } from "../../store/roleStore";
import { Button, Box, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import Leaderboard from "../Leaderboard";
import { Player } from "../../types/types";
import Confetti from "react-confetti";

interface PlateBalanceWinner {
  restaurant: string;
  winnerUser: string;
  winnerScore: number;
}

const PlateBalanceGame: React.FC = () => {
  const { socket } = useWebSocket();
  const role = useRoleStore((state) => state.role);
  const [gameStarted, setGameStarted] = useState(false);
  const [tiltAngleX, setTiltAngleX] = useState<number | null>(null);
  const [tiltAngleY, setTiltAngleY] = useState<number | null>(null);
  const [balanceTime, setBalanceTime] = useState<number>(0);
  const [gameWinner, setGameWinner] = useState<PlateBalanceWinner>();
  const [playerScores, setPlayerScores] = useState<Player[]>();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isBalancing, setIsBalancing] = useState(false);
  const [fallDetected, setFallDetected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (socket) {
      socket.on("plate-balance-started", () => {
        setGameStarted(true);
        startCountdown();
      });

      socket.on(
        "plate-balance-winner",
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
        socket.off("plate-balance-started");
        socket.off("plate-balance-winner");
      };
    }
  }, [socket]);

  const startCountdown = () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown != null && prevCountdown > 0) {
          return prevCountdown - 1;
        } else {
          clearInterval(countdownInterval);
          setCountdown(null);
          startBalanceTracking();
          return null;
        }
      });
    }, 1000);
  };

  const startBalanceTracking = () => {
    setIsBalancing(true);
    window.addEventListener("deviceorientation", handleDeviceTilt);
    startBalanceTimer();
  };

  const startBalanceTimer = () => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      if (!fallDetected) {
        setBalanceTime(Date.now() - startTime);
      } else {
        clearInterval(timer);
      }
    }, 100);
  };

  const handleDeviceTilt = (event: DeviceOrientationEvent) => {
    const { beta, gamma } = event;
    if (beta && gamma) {
      setTiltAngleX(Math.abs(gamma));
      setTiltAngleY(Math.abs(beta));

      if (Math.abs(beta) > 45 || Math.abs(gamma) > 45) {
        setFallDetected(true);
        stopBalanceTracking();
      }
    }
  };

  const stopBalanceTracking = () => {
    setIsBalancing(false);
    window.removeEventListener("deviceorientation", handleDeviceTilt);
  };

  useEffect(() => {
    if (fallDetected && socket) {
      socket.emit("plate-balance-finished", balanceTime);
    }
  }, [fallDetected, balanceTime, socket]);

  useEffect(() => {
    if (gameWinner) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
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

      {role === "host" && !gameStarted && (
        <Button
          variant="contained"
          onClick={() => socket?.emit("start-plate-balance")}
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

      {isBalancing && (
        <>
          <Typography variant="h6" sx={{ marginBottom: "20px", color: "#777" }}>
            Tilt X: {tiltAngleX?.toFixed(2)}°, Tilt Y: {tiltAngleY?.toFixed(2)}°
          </Typography>
          <Typography variant="h6" sx={{ marginBottom: "20px", color: "#777" }}>
            Time Balanced: {(balanceTime / 1000).toFixed(2)}s
          </Typography>
        </>
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
            {gameWinner.winnerUser} has won by balancing for{" "}
            {gameWinner.winnerScore} seconds. Their selected restaurant is:{" "}
            <span style={{ fontWeight: "bold" }}>{gameWinner.restaurant}</span>
          </Typography>
          <Leaderboard scores={playerScores} />
        </>
      )}
    </Box>
  );
};

export default PlateBalanceGame;
