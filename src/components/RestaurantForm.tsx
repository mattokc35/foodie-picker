import { useState, useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import {
  Button,
  TextField,
  Box,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import IcecreamIcon from "@mui/icons-material/Icecream";
import MessageDisplay from "../components/MessageDisplay";

interface restaurantFormProps {
  sessionId?: string;
}

const RestaurantForm = ({ sessionId }: restaurantFormProps) => {
  const [restaurant, setRestaurant] = useState("");
  const [hasSuggested, setHasSuggested] = useState(false); // Track whether the user has suggested
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Track error messages
  const { socket } = useWebSocket();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSubmit = () => {
    if (socket && restaurant) {
      socket.emit("suggest-restaurant", sessionId, restaurant);
      setHasSuggested(true); // Disable form after submission
    }
  };

  useEffect(() => {
    if (socket) {
      // Listen for any errors from the backend
      socket.on("error", (message) => {
        setErrorMessage(message); // Set the error message
      });

      // Clean up the listener
      return () => {
        socket.off("error");
      };
    }
  }, [socket]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "10px" : "30px", 
        width: isMobile ? "100%" : "400px", 
        marginTop: isMobile ? "10px" : "20px",
        backgroundColor: "#fff3e0", // Soft background color
        borderRadius: "12px",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <RestaurantIcon sx={{ color: "#ff5722", fontSize: 40 }} />
        <IcecreamIcon sx={{ color: "#ffc107", fontSize: 40 }} />
      </Stack>

      <Typography
        variant="h6"
        sx={{ marginBottom: "10px", color: "#333", fontWeight: "bold" }}
      >
        Suggest a Restaurant
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={restaurant}
            onChange={(e) => setRestaurant(e.target.value)}
            label="Enter Restaurant Name"
            variant="outlined"
            size="medium"
            disabled={hasSuggested} // Disable input after suggestion
            sx={{
              input: { color: "#333" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#888",
                },
                "&:hover fieldset": {
                  borderColor: "#ff9800",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ff5722",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#888",
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            fullWidth
            disabled={hasSuggested} // Disable button after suggestion
            sx={{
              padding: "14px",
              backgroundColor: "#ff5722", // Button color matching the theme
              color: "#fff",
              fontWeight: "bold",
              maxWidth: "400px",
              borderRadius: "12px",
              "&:hover": {
                backgroundColor: "#ff1744",
              },
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)", // Button shadow for a cute feel
            }}
          >
            Suggest
          </Button>
        </Grid>
      </Grid>

      {/* Display error message */}
      {hasSuggested && (
        <MessageDisplay
          message={`You have suggested the restaurant '${restaurant}'. Waiting for others...`}
          type="validation"
        />
      )}

      <MessageDisplay message={errorMessage} type="error" />
    </Box>
  );
};

export default RestaurantForm;
