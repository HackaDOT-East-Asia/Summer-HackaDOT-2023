import { styled } from "@stitches/react";
import nft_1 from "../assets/nft_1.png";
import Image from "next/image";
import { useState } from "react";
import SelectNftModal from "./SelectNftModal";

const SideMenu = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectNft = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <SideBar>
        <Menu>Matches</Menu>
        <Vstack>
          <Image
            src={nft_1}
            width="160px"
            height="160px"
            style={{ borderRadius: "50%" }}
          />
          <SwitchButton onClick={handleSelectNft}>Switch NFT</SwitchButton>
        </Vstack>
      </SideBar>
      {isModalOpen && (
        <SelectNftModal onClickCloseModal={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default SideMenu;

const SideBar = styled("div", {
  paddingBottom: "65px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "360px",
  backgroundColor: "#1E1E1E",
});

const Menu = styled("div", {
  width: "100%",
  padding: "34px 42px",
  display: "flex",
  alignItems: "center",
  fontSize: "20px",
  fontWeight: "bold",
  backgroundColor: "#000000",
});

const Vstack = styled("div", {
  paddingTop: "320px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "160px",
  gap: "20px",
});

const SwitchButton = styled("button", {
  width: "100%",
  height: "36px",
  backgroundColor: "transparent",
  border: "1px solid #fafafa",
  borderRadius: "40px",
  color: "#fafafa",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
});
