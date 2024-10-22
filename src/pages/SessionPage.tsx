import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWebSocket } from "../contexts/WebSocketContext";
import RestaurantForm from "../components/RestaurantForm";
import SpinWheel from "../components/games/SpinWheel";
import QuickDrawGame from "../components/games/QuickDrawGame";
import { useRoleStore } from "../store/roleStore";
import {
  Box,
  Typography,
  List,
  ListItem,
  Stack,
  Button,
  Modal,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import IcecreamIcon from "@mui/icons-material/Icecream";
import MessageDisplay from "../components/MessageDisplay";
import { User, Restaurant, Game } from "../types/types";

const SessionPage = () => {
  const { socket, connected } = useWebSocket();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useRoleStore((state) => state.role);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sessionDeleted, setSessionDeleted] = useState<boolean>(false);
  const [gameOption, setGameOption] = useState<Game>("wheel");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (socket && id) {
      if (role === "host") {
        socket.emit("create-session", id);
      } else {
        socket.emit("join-session", id);
      }

      socket.on("current-restaurants", (restaurantList: Restaurant[]) => {
        setRestaurants(restaurantList);
      });

      socket.on("user-details", (userInfo: User) => {
        setCurrentUser(userInfo);
      });

      socket.on("game-option-updated", (newGameOption: string) => {
        setGameOption(newGameOption as Game);
      });

      socket.on("restaurant-suggested", (newRestaurant: Restaurant) => {
        setRestaurants((prev) => [...prev, newRestaurant]);
      });

      socket.on("restaurant-selected", (restaurant: string) => {
        setSuccessMessage(`Selected restaurant: ${restaurant}`);
      });

      socket.on("current-users", ({ count }: { count: number }) => {
        setUserCount(count);
      });

      socket.on("session-deleted", () => {
        setSessionDeleted(true);
      });

      return () => {
        socket.emit("leave-session", id);
        socket.off("current-restaurants");
        socket.off("restaurant-suggested");
        socket.off("restaurant-selected");
        socket.off("current-users");
        socket.off("session-deleted");
        socket.off("game-option-updated");
        socket.off("user-details");
      };
    }
  }, [socket, id, role, navigate]);

  const handleModalClose = () => {
    setSessionDeleted(false);
    navigate("/");
  };

  const handleGameOptionChange = (e: any) => {
    const newGameOption = e.target.value as string;
    setGameOption(newGameOption as Game);
    if (role === "host" && socket) {
      socket.emit("game-option-changed", {
        sessionId: id,
        gameOption: newGameOption,
      });
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        minHeight: "100vh",
        backgroundColor: "#fff3e0", // Matching light background
        padding: isMobile ? "20px" : "40px",
        color: theme.palette.text.primary,
        textAlign: "center",
        overflowY: "auto",
      }}
    >
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

      <Box
        sx={{
          width: isMobile ? "90%" : "620px",
          backgroundColor: isMobile ? "transparent" : "#fff3e0",
          borderRadius: isMobile ? "0px" : "12px",
          padding: isMobile ? "10px" : "30px",
          boxShadow: isMobile ? "none" : "0px 4px 12px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{
            marginBottom: "20px",
            fontWeight: 500,
            color: "#333",
          }}
        >
          Room ID: {id}
        </Typography>

        {connected && role ? (
          <>
            <Typography variant="h6" sx={{ color: "#ff9800" }}>
              Hello {currentUser && currentUser.username}!
            </Typography>

            {role === "host" ? (
              <Typography variant="h6" sx={{ color: "#ff9800" }}>
                You are the Host. Suggest a restaurant and wait for others to
                join.
              </Typography>
            ) : (
              <Typography variant="h6" sx={{ color: "#ff9800" }}>
                You are a Guest. Suggest a restaurant and wait for the host to
                start!
              </Typography>
            )}

            {userCount && (
              <Typography
                variant="body1"
                sx={{ color: "#777", fontStyle: "italic", my: 2 }}
              >
                {userCount}/10 foodies joined
              </Typography>
            )}
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "20px",
              }}
            >
              <RestaurantForm sessionId={id} />
            </Box>

            <Box sx={{ width: "100%", marginTop: "20px" }}>
              <Typography
                variant="h6"
                sx={{ color: "#333", marginBottom: "10px" }}
              >
                Suggested Restaurants:
              </Typography>
              {restaurants.length > 0 ? (
                <List
                  sx={{
                    width: "100%",
                    bgcolor: "transparent",
                    maxHeight: "300px",
                    overflowY: "auto",
                    padding: 0,
                  }}
                >
                  {restaurants.map((restaurant, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        backgroundColor: "#F1F1F1",
                        padding: "10px",
                        borderRadius: "8px",
                        marginBottom: "10px",
                        "&:hover": {
                          backgroundColor: "#EAEAEA",
                        },
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography sx={{ color: "#333", fontWeight: "bold" }}>
                        {restaurant.name} ({restaurant.suggestedBy.username})
                      </Typography>
                      <FastfoodIcon sx={{ color: "#ff9800" }} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="h6" sx={{ color: "#aaa" }}>
                  None
                </Typography>
              )}
            </Box>

            {restaurants.length > 0 && (
              <Box sx={{ marginTop: "30px" }}>
                {role === "host" ? (
                  <FormControl fullWidth sx={{ marginBottom: "10px" }}>
                    <Typography variant="h6" sx={{ color: "#333" }}>
                      Choose Game:
                    </Typography>
                    <Select
                      labelId="select-game-label"
                      id="select-game"
                      value={gameOption}
                      onChange={handleGameOptionChange}
                    >
                      <MenuItem value="wheel">Spin the Wheel</MenuItem>
                      <MenuItem value="quick-draw">Quick Draw Game</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Typography sx={{ color: "#ff9800" }}>
                    Currently selected game: {gameOption}
                  </Typography>
                )}

                {gameOption === "wheel" ? (
                  <SpinWheel restaurants={restaurants} />
                ) : (
                  <QuickDrawGame />
                )}
              </Box>
            )}
          </>
        ) : (
          <Typography variant="body1" sx={{ color: "#ccc" }}>
            Connecting...
          </Typography>
        )}
      </Box>

      <MessageDisplay message={successMessage} type="validation" />

      <Modal
        open={sessionDeleted}
        onClose={handleModalClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography
            id="modal-title"
            variant="h6"
            component="h2"
            sx={{ color: "#ff5722" }}
          >
            Session Deleted
          </Typography>
          <Typography id="modal-description" sx={{ color: "#ff5722", mt: 2 }}>
            The session has been deleted by the host.
          </Typography>
          <Button
            onClick={handleModalClose}
            variant="contained"
            sx={{
              mt: 3,
              backgroundColor: "#ff5722",
              color: "#fff",
            }}
          >
            Back To Home
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default SessionPage;
