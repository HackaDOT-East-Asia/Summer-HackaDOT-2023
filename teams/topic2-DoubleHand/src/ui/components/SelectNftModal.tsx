import { styled } from "@stitches/react";
import nft_1 from "../assets/nft_1.png";
import nft_2 from "../assets/nft_2.png";
import nft_3 from "../assets/nft_3.png";
import Image from "next/image";
import { useEffect } from "react";
import { preventScroll, allowScroll } from "../utils/scroll";
import IconClose from "../assets/IconClose";

const SelectNftModal = ({
  onClickCloseModal,
}: {
  onClickCloseModal: () => void;
}) => {
  useEffect(() => {
    const prevScrollY = preventScroll();
    return () => {
      allowScroll(prevScrollY);
    };
  }, []);

  return (
    <Dimmed>
      <div style={{ position: "absolute", top: 10, right: 40, padding: 20 }}>
        <button onClick={onClickCloseModal}>
          <IconClose />
        </button>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "60px",
          paddingTop: "60px",
        }}
      >
        <div>
          <Image src={nft_1} width="320px" height="320px" />
        </div>
        <div style={{ border: "8px solid #FAFAFA" }}>
          <Image src={nft_2} width="440px" height="440px" />
        </div>
        <div>
          <Image src={nft_3} width="320px" height="320px" />
        </div>
      </div>
      <Button>Select</Button>
    </Dimmed>
  );
};

export default SelectNftModal;

const Dimmed = styled("div", {
  height: "calc(100vh - 84px)",
  position: "fixed",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  top: 84,
  left: 0,
  right: 0,
  bottom: 0,
  gap: "60px",
  zIndex: 20,
  background: "#1E1E1E",
});

const Button = styled("button", {
  width: "360px",
  height: "80px",
  backgroundColor: "#E54180",
  border: "6px solid #1E1E1E",
  borderRadius: "40px",
  color: "#1E1E1E",
  fontWeight: "bold",
  fontSize: "36px",
  cursor: "pointer",
});
