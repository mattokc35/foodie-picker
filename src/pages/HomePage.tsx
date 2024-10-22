import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useRoleStore } from "../store/roleStore";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import IcecreamIcon from "@mui/icons-material/Icecream";
import MessageDisplay from "../components/MessageDisplay"; // Import the new component

const generateRoomId = () => {
  return Math.random().toString(36).substr(2, 4).toUpperCase();
};

const HomePage = () => {
  const [sessionId, setSessionId] = useState("");
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const setRole = useRoleStore((state) => state.setRole);
  const { socket } = useWebSocket(); // Access the socket instance

  // Handle session creation
  const handleCreateSession = () => {
    setErrorMessage(null);
    const newSessionId = generateRoomId();
    setRole("host");
    setSessionId(newSessionId);
    // Copy to clipboard
    navigator.clipboard.writeText(newSessionId);
    setValidationMessage(
      `Room ${newSessionId} copied to clipboard. Navigating to your room now...`
    );

    setTimeout(() => {
      // Navigate to session page (creation handled there)
      navigate(`/session/${newSessionId}`);
    }, 2000);
  };

  const handleCheckSession = () => {
    if (!sessionId) {
      setErrorMessage("Please enter a session ID.");
    }
    if (sessionId && socket) {
      socket.emit("check-session", sessionId);

      //if session exists and is available
      socket.on("session-exists", () => {
        setRole("guest");
        setValidationMessage(`Found room ${sessionId}! Going there now...`);
        setTimeout(() => {
          navigate(`/session/${sessionId}`);
        }, 2000);
      });

      socket.on("room-full", () => {
        setErrorMessage("Room is full. Please try another session");
      });

      socket.on("session-not-found", () => {
        setErrorMessage("Session not found. Please try again.");
      });
    }
  };

  const handleSessionIdChange = (id: string) => {
    setSessionId(id);
    setErrorMessage(null);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        backgroundColor: "#fff3e0", // Lighter background for a friendly look
        minHeight: "95vh",
        color: theme.palette.text.primary,
        padding: isMobile ? "20px" : "40px",
        textAlign: "center",
        borderRadius: "12px", // Rounded edges for the entire container
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)", // Add a soft shadow
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" mb={4}>
        <RestaurantIcon
          sx={{
            color: "#ff9800",
            fontSize: 50,
            "&:hover": { transform: "scale(1.2)", transition: "0.3s" },
          }}
        />
        <FastfoodIcon
          sx={{
            color: "#ff5722",
            fontSize: 50,
            "&:hover": { transform: "scale(1.2)", transition: "0.3s" },
          }}
        />
        <IcecreamIcon
          sx={{
            color: "#ffc107",
            fontSize: 50,
            "&:hover": { transform: "scale(1.2)", transition: "0.3s" },
          }}
        />
      </Stack>

      <Typography
        variant="h5"
        sx={{ marginBottom: "20px", color: "#ff5722", fontWeight: "bold" }}
      >
        Create or Join a Room
      </Typography>

      <Button
        variant="contained"
        onClick={handleCreateSession}
        sx={{
          maxWidth: "400px",
          padding: "12px",
          marginBottom: "20px",
          backgroundColor: "#ff5722", // Bright button color
          color: "#fff",
          fontWeight: "bold",
          borderRadius: "12px",
          "&:hover": { backgroundColor: "#ff1744" },
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        Create a Room
      </Button>

      <TextField
        fullWidth
        label="Enter Session ID"
        value={sessionId}
        onChange={(e) => handleSessionIdChange(e.target.value)}
        variant="outlined"
        sx={{
          input: { color: "#333" },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#888" },
            "&:hover fieldset": { borderColor: "#ff9800" },
            "&.Mui-focused fieldset": { borderColor: "#ff5722" },
          },
          "& .MuiInputLabel-root": { color: "#888" },
          maxWidth: "250px",
        }}
      />

      <Button
        onClick={handleCheckSession}
        variant="contained"
        color="primary"
        sx={{
          marginTop: "20px",
          maxWidth: "400px",
          padding: "12px",
          backgroundColor: "#ff5722", // Button matches the theme
          color: "#fff",
          fontWeight: "bold",
          borderRadius: "12px",
          "&:hover": { backgroundColor: "#ff1744" },
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        Join Room
      </Button>

      <MessageDisplay message={errorMessage} type="error" />
      <MessageDisplay message={validationMessage} type="validation" />
    </Box>
  );
};

export default HomePage;
