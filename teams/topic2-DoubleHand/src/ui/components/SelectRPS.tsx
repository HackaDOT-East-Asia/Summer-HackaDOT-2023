import { styled } from "@stitches/react";
import IconRock from "../assets/IconRock";
import IconPaper from "../assets/IconPaper";
import IconScissors from "../assets/IconScissors";
import IconClose from "../assets/IconClose";
import { MouseEvent } from "react";

type Rps = "ROCK" | "SCISSORS" | "PAPER";

interface SelectRPSProps {
  closeSelector: () => void;
}

const SelectRPS = ({ closeSelector }: SelectRPSProps) => {
  const handleSelectRps = (
    e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    selected: Rps
  ) => {
    e.stopPropagation();

    if (selected === "ROCK") {
      console.log("바위");
    }

    if (selected === "SCISSORS") {
      console.log("가위");
    }

    if (selected === "PAPER") {
      console.log("보");
    }

    closeSelector();
  };

  return (
    <Dimmed>
      <div>
        <button
          style={{
            position: "absolute",
            right: 17,
            top: 13,
            cursor: "pointer",
          }}
          onClick={closeSelector}
        >
          <IconClose />
        </button>
      </div>
      <div style={{ fontSize: "24px" }}>Choose your move</div>
      <RpsWrapper>
        <RpsBox onClick={(e) => handleSelectRps(e, "ROCK")}>
          <IconRock />
          Rock
        </RpsBox>
        <RpsBox onClick={(e) => handleSelectRps(e, "PAPER")}>
          <IconPaper />
          Paper
        </RpsBox>
        <RpsBox onClick={(e) => handleSelectRps(e, "SCISSORS")}>
          <IconScissors />
          Scissors
        </RpsBox>
      </RpsWrapper>
    </Dimmed>
  );
};

const Dimmed = styled("div", {
  padding: "25px 17px 31px",
  width: "520px",
  height: "248px",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -80%)",
  zIndex: 10,
  background: "#1E1E1E",
  borderRadius: "36px",
  color: "#FAFAFA",
  cursor: "default",
});

const RpsWrapper = styled("div", {
  paddingTop: "32px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "56px",
});

const RpsBox = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  fontSize: "24px",
  fontWeight: "400",
  color: "#C2C2C2",
  cursor: "pointer",
});

export default SelectRPS;
