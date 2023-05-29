import Image, { StaticImageData } from "next/image";
import nft_2 from "../assets/nft_2.png";

const NftCard = ({
  image,
  isMySide = false,
}: {
  image: string | StaticImageData;
  isMySide?: boolean;
}) => {
  return (
    <div
      style={{
        width: "360px",
        maxHeight: "463px",
        backgroundColor: "#1E1E1E",
        border: "4px solid #1E1E1E",
        borderRadius: "24px",
      }}
    >
      <Image src={image} style={{ borderRadius: "24px" }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "22px 42px",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            color: isMySide ? "#E54180" : "#368DFF",
            fontSize: "22px",
          }}
        >
          NFT NAME
        </div>
        <div>Wins: 6</div>
      </div>
    </div>
  );
};

export default NftCard;
