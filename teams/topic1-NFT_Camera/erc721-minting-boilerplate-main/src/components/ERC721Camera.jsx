import { useState, useEffect } from "react";
import { NFTStorage, File } from "nft.storage";
import useWeb3 from "../hooks/useWeb3";

const nftName = "HDEASHD #"
const nftDescription = "This is not NFT Art. This is the NFT that was minted with the NFT Camera during NFT Camera development.";

const nftStorage = new NFTStorage({
  token: process.env.REACT_APP_NFT_STORAGE_KEY,
});

const store = async (name, description, data, fileName, type) => {
  const metadata = await nftStorage.store({
    name,
    description,
    image: new File([data], fileName, { type }),
  });
  console.log(metadata);
  return metadata;
};

export const ERC721Camera = () => {
  const { userAddress, mintNFT } = useWeb3();
  const [blob, setBlob] = useState(null);
  const [base64, setBase64] = useState(null);
  const [onGoing, setOnGoing] = useState(false);

  const [fileName, setFileName] = useState("photo.jpg");
  const [type, setType] = useState("image/jpeg");
  const [name, setName] = useState("");
  const [description, setDescription] = useState(nftDescription);

  const { getTokenURI } = useWeb3();
  const [name2, setName2] = useState("");
  const [image, setImage] = useState("");
  const {getTotalSupply} = useWeb3();

  const readAsBlob = (file) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      //console.log(reader.result);
      setBlob(reader.result);
    };
  };

  const readAsBase64 = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      //console.log(reader.result);
      setBase64(reader.result);
    };
  };

  const submit = async () => {
    console.log("name : " + name);
    console.log("description : " + description);
    console.log("blob : " + blob);
    console.log("fileName : " + fileName);
    console.log("type : " + type);

    setOnGoing(true);
    try {
      const metadata = await store(name, description, blob, fileName, type);
      const inputUrl = metadata.url.replace(/^ipfs:\/\//, "");

      const tx = await mintNFT(userAddress, inputUrl);
      const receipt = await tx.wait();
      console.log(receipt);

      const id = await getTotalSupply() - 1;
      const tokenUri = await getTokenURI(id);
      const url = await tokenUri.replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/");
      const res = await fetch(url);
      const data = await res.json();

      await setName2(data.name);
      await setBase64(data.image.replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/"));

    } catch (err) {
      console.error(err);
    } finally {
      setOnGoing(false);
    }
  };

  var webSocket;
  var messageTextArea = document.getElementById("messageTextArea");

  const connect = () => {

    webSocket = new WebSocket("ws://localhost:8001");

    webSocket.onopen = function(message){
      //messageTextArea.value += "Server connect... OK\n";
    };

    webSocket.onclose = function(message){
      //messageTextArea.value += "Server Disconnect... OK\n";
    };

    webSocket.onerror = function(message){
      //messageTextArea.value += "error...\n";
    };

    webSocket.onmessage = async function(message){
      setOnGoing(true);
      setBase64(null);
      setName(null);
      const nextId = await getTotalSupply();

      await setName(nftName + nextId.toString());

      const jpeg_data = message.data
      await readAsBlob(jpeg_data);
      await readAsBase64(jpeg_data);
    };
  };

  function disconnect(){
    webSocket.close();
  };

  useEffect(() => {
    if (blob != null) {
      submit();
    }
  }, [blob]);

  window.onload = async function(){	// 2023.05.27 ADD
    connect();
  }

  return (
    <div className="wrapper">
      {base64 ? (
        <>
          <img src={base64} alt="image" className="image" />
          {onGoing ? (
            <>
              <div className="name">Minting...</div>
            </>
          ) : (
            <>
              <div className="name">{name2}</div>
            </>
          )}

        </>
      ) : (
        <>
          <div className = "title">NFT camera</div>
        </>
      )}
    </div>
  );
};
