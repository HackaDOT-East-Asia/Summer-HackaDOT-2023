import { styled } from '@stitches/react';
import nft_1 from '../assets/nft_1.png';
import nft_2 from '../assets/nft_2.png';
import nft_3 from '../assets/nft_3.png';
import Image from 'next/image';
import { useSubstrateContext } from './Context';
import { Menu, MenuButton, MenuItem, MenuList, Select } from '@chakra-ui/react';

const MainPage = () => {
  const { accounts, setAccount } = useSubstrateContext();

  const handleOnSelect = async (event: any) => {
    if (accounts) setAccount(accounts[event.target.value]);
  };

  return (
    <>
      <Wrapper>
        <ImageWrapper>
          <Image src={nft_1} width="360px" height="360px" />
          <Image src={nft_2} width="360px" height="360px" />
          <Image src={nft_3} width="360px" height="360px" />
        </ImageWrapper>
        <div>{`Gorem ipsum dolor sit amet,\n consectetur adipiscing elit.`}</div>
        <Menu size="xs">
          <MenuButton>
            <ConnectWalletButton>connect wallet</ConnectWalletButton>
          </MenuButton>
          <MenuList fontSize="xs">
            {accounts?.map((account, i) => (
              <MenuItem key={i} value={i} onClick={() => handleOnSelect({ target: { value: i } })}>
                {account.meta.name as string} {account.address.slice(0, 4) + '...' + account.address.slice(-4)}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Wrapper>
    </>
  );
};

export default MainPage;

const Wrapper = styled('div', {
  height: 'calc(100vh - 84px)',
  paddingTop: '36px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '28px',
  backgroundColor: 'black',
  color: '#ffffff',
  fontWeight: 'bold',
  fontSize: '60px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

const ConnectWalletButton = styled('button', {
  width: '600px',
  height: '80px',
  backgroundColor: 'transparent',
  border: '6px solid #fafafa',
  borderRadius: '40px',
  color: '#fafafa',
  fontWeight: 'bold',
  fontSize: '36px',
  cursor: 'pointer',
});

const ImageWrapper = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '20px',
});
