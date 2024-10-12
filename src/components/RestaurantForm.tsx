import { useState, useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import {
  Button,
  TextField,
  Box,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const RestaurantForm = () => {
  const [restaurant, setRestaurant] = useState("");
  const [hasSuggested, setHasSuggested] = useState(false); // Track whether the user has suggested
  const { socket } = useWebSocket();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSubmit = () => {
    if (socket && restaurant) {
      socket.emit("suggest-restaurant", restaurant);
      setRestaurant("");
      setHasSuggested(true); // Disable form after submission
    }
  };

  useEffect(() => {
    if (socket) {
      // Listen for any errors from the backend
      socket.on("error", (message) => {
        alert(message); // Show the error (e.g., if the user has already suggested)
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
        padding: isMobile ? "10px" : "30px", // Reduced padding on mobile
        width: isMobile ? "100%" : "400px", // Full width on mobile
        marginTop: isMobile ? "10px" : "20px",
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            value={restaurant}
            onChange={(e) => setRestaurant(e.target.value)}
            label="Suggest a Restaurant"
            variant="outlined"
            size="medium"
            disabled={hasSuggested} // Disable input after suggestion
            sx={{
              input: { color: "#fff" },
              maxWidth: isMobile ? "100%" : "500px",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#555",
                },
                "&:hover fieldset": {
                  borderColor: "#888",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#00bcd4",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#aaa",
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
              padding: isMobile ? "10px" : "14px",
              fontSize: isMobile ? "14px" : "16px",
              backgroundColor: "#ff5722", // Button color matching the food theme
              color: "#fff",
              fontWeight: "bold",
              maxWidth: isMobile ? "100%" : "250px",
              "&:hover": {
                backgroundColor: "#ff1744",
              },
            }}
          >
            Suggest
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RestaurantForm;
