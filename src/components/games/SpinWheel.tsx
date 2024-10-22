import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { Button, Box, Typography, Stack } from "@mui/material";
import { Wheel } from "react-custom-roulette";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import IcecreamIcon from "@mui/icons-material/Icecream";
import Confetti from "react-confetti";
import { useRoleStore } from "../../store/roleStore";
import MessageDisplay from "../MessageDisplay";
import { Restaurant } from "../../types/types";
type SpinWheelProps = {
  restaurants: Restaurant[];
};

const SpinWheel: React.FC<SpinWheelProps> = ({ restaurants }) => {
  const { socket } = useWebSocket();
  const navigate = useNavigate();
  const role = useRoleStore((state) => state.role);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(
    null
  );
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [mustSpin, setMustSpin] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const restaurantSpinData = restaurants.map((restaurant) => ({
    option: restaurant.name,
  }));

  const handleSpin = () => {
    if (socket && restaurants.length > 0 && !spinning && role === "host") {
      setSpinning(true);
      socket.emit("spin-wheel");
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("spin-wheel", ({ index }) => {
        setSelectedRestaurant(null);
        setSpinResult(index);
        setMustSpin(true);
        setSpinning(true);
      });

      return () => {
        socket.off("spin-wheel");
      };
    }
  }, [socket, navigate]);

  useEffect(() => {
    if (selectedRestaurant) {
      setShowConfetti(true);
      setSuccessMessage(
        `Selected restaurant: ${selectedRestaurant}. This room is now closing.`
      );
      setTimeout(() => {
        setShowConfetti(false);
        socket?.emit("delete-session");
      }, 5000);
    }
  }, [selectedRestaurant, socket]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{
        backgroundColor: "#fff3e0",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
      }}
    >
      {showConfetti && <Confetti />}

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="center"
        mb={4}
      >
        <RestaurantIcon sx={{ color: "#ff9800", fontSize: 50 }} />
        <FastfoodIcon sx={{ color: "#ff5722", fontSize: 50 }} />
        <LocalPizzaIcon sx={{ color: "#ff1744", fontSize: 50 }} />
        <IcecreamIcon sx={{ color: "#ffc107", fontSize: 50 }} />
      </Stack>

      {restaurants.length > 0 && (
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={spinResult ?? 0}
          data={restaurantSpinData}
          backgroundColors={["#ff9800", "#ff5722", "#ff1744", "#ffc107"]}
          textColors={["#ffffff"]}
          onStopSpinning={() => {
            setSpinning(false);
            setMustSpin(false);
            setSelectedRestaurant(restaurants[spinResult ?? 0].name);
          }}
          outerBorderColor="#333"
          outerBorderWidth={8}
          innerRadius={20}
          radiusLineColor="#fff"
          radiusLineWidth={5}
          fontSize={18}
          perpendicularText={true}
          spinDuration={0.5}
        />
      )}

      {!mustSpin && selectedRestaurant && (
        <>
          <Typography
            variant="body1"
            sx={{ color: "#ff5722", marginTop: "20px" }}
          >
            Selected Restaurant: {selectedRestaurant}
          </Typography>
          <Typography variant="body1" sx={{ color: "#333", marginTop: "20px" }}>
            Thanks for playing! This room is now closing, and you will be
            redirected back to the home page.
          </Typography>
        </>
      )}

      {role === "host" && (
        <Button
          variant="contained"
          onClick={handleSpin}
          sx={{
            marginTop: "20px",
            padding: "12px",
            backgroundColor: "#ff5722",
            color: "#fff",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#ff1744",
            },
            maxWidth: "400px",
            borderRadius: "12px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
          }}
          disabled={spinning}
        >
          Spin the Wheel
        </Button>
      )}

      {/* Display messages */}
      <MessageDisplay message={successMessage} type="validation" />
    </Box>
  );
};

export default SpinWheel;
