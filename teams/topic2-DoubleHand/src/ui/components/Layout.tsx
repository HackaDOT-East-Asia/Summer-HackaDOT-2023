import { styled } from '@stitches/react';
import { FC, ReactNode } from 'react';
import DoubleHandLogo from '../assets/DoubleHandLogo';
import IconWallet from '../assets/IconWallet';
import { useSubstrateContext } from './Context';

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const { accounts, setAccount } = useSubstrateContext();

  const handleOnSelect = async (event: any) => {
    if (accounts) setAccount(accounts[event.target.value]);
  };

  return (
    <>
      <Header>
        <DoubleHandLogo />
        <ConnectionIconButton>
          <IconWallet />
          <select onChange={handleOnSelect} style={{ width: '150px' }}>
            <option value="">Select Address</option>
            {accounts?.map((account, i) => (
              <option key={i} value={i}>
                {account.meta.name as string} {account.address.slice(0, 4) + '...' + account.address.slice(-4)}
              </option>
            ))}
          </select>
        </ConnectionIconButton>
      </Header>
      {children}
    </>
  );
};

export default Layout;

const Header = styled('header', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '25px 40px',
  backgroundColor: '#3c3c3c',
});

const ConnectionIconButton = styled('button', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: 'transparent',
  color: '#fafafa',
  fontWeight: 'bold',
  fontSize: '20px',
  border: 'none',
  cursor: 'pointer',
});
