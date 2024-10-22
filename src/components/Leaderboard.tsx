import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import { Player } from "../types/types";

interface LeaderboardProps {
  scores: Player[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  scores,
}: LeaderboardProps) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        maxWidth: 600,
        margin: "auto",
        backgroundColor: "#fff3e0", // Matching background color
        borderRadius: "12px", // Rounded corners
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)", // Soft shadow
        padding: "20px",
      }}
    >
      <Typography
        variant="h4"
        component="h2"
        sx={{
          textAlign: "center",
          my: 3,
          fontWeight: "bold",
          color: "#ff5722", // Bright, bold text color
        }}
      >
        Leaderboard
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              align="center"
              sx={{ color: "#ff9800", fontWeight: "bold" }}
            >
              Rank
            </TableCell>
            <TableCell sx={{ color: "#ff5722", fontWeight: "bold" }}>
              Username
            </TableCell>
            <TableCell
              align="right"
              sx={{ color: "#ff1744", fontWeight: "bold" }}
            >
              Score
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {scores.map((row, index) => (
            <TableRow
              key={row.username}
              sx={{
                backgroundColor: index % 2 === 0 ? "#FFE0B2" : "#FFCC80",
                "&:hover": { backgroundColor: "#FFD54F" },
              }}
            >
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", color: "#ff9800" }}
              >
                {index + 1}
              </TableCell>
              <TableCell sx={{ color: "#ff5722" }}>{row.username}</TableCell>
              <TableCell align="right" sx={{ color: "#ff1744" }}>
                {row.score}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Leaderboard;
