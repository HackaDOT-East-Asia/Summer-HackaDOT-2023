import { styled } from '@stitches/react';
import SideMenu from './SideMenu';
import nft_1 from '../assets/nft_1.png';
import nft_2 from '../assets/nft_2.png';
import PlayButton from './PlayButton';
import NftCard from './NftCard';
import { useAllMembersInfo, useGameInfo } from '../hook';
import { useSubstrateContext } from './Context';
import { Spinner } from '@chakra-ui/react';

const GamePage = () => {
  const { data } = useAllMembersInfo();
  const { account } = useSubstrateContext();

  if (!data || !account) return <Spinner />;

  const memberInfo = data?.find((member: any) => member.owner === account.address);

  if (!memberInfo) return <Spinner />;

  return (
    <Wrapper>
      <SideMenu />
      <div
        style={{
          padding: '60px 166px',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>END IN</div>
          <div style={{ fontSize: '40px', fontWeight: 'bold' }}>21 : 12 : 30</div>
          <div>HRS : MIN : SEC</div>
        </div>

        <div style={{ display: 'flex', gap: '75px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '43px' }}>
            <NftCard image={nft_1} isMySide />
            <PlayButton />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '43px' }}>
            <NftCard image={nft_2} />
            <ButtonWrapper>
              <NftDetailButton>See NFT details</NftDetailButton>
              <div>Your opponent has selected their move. </div>
            </ButtonWrapper>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default GamePage;

const Wrapper = styled('div', {
  display: 'flex',
  backgroundColor: '#3148B8',
});

const ButtonWrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
});

const NftDetailButton = styled('button', {
  backgroundColor: 'transparent',
  color: '#FAFAFA',
  border: 'none',
  textDecorationLine: 'underline',
  fontSize: '20px',
});
