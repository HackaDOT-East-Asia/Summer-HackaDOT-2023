import { styled } from "@stitches/react";
import SelectRPS from "./SelectRPS";
import { useState } from "react";

const PlayButton = () => {
  const [isShowRpsSelector, setIsShowRpsSelector] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <Button onClick={() => setIsShowRpsSelector(true)}>Start</Button>
      {isShowRpsSelector && (
        <SelectRPS closeSelector={() => setIsShowRpsSelector(false)} />
      )}
    </div>
  );
};

const Button = styled("button", {
  width: "100%",
  height: "80px",
  backgroundColor: "#E54180",
  border: "6px solid #1E1E1E",
  borderRadius: "40px",
  color: "#1E1E1E",
  fontWeight: "bold",
  fontSize: "36px",
  cursor: "pointer",
});

export default PlayButton;
