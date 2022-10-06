import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ThemeProvider } from 'styled-components';
import { ThorinGlobalStyles, lightTheme, Card, Profile, Heading, FieldSet, Input as TInput, Toast, Button } from '@ensdomains/thorin';
import { ethers, Contract, providers } from 'ethers';
import toast, { Toaster } from 'react-hot-toast';

import { abi, externalAbi } from './abi';

const truncateAddress = (address: string) => {
  return `${address.substring(0, 8)}...${address.substring(34, 42)}`;
}

function App() {
  const name = (window.location.host.split('.').length === 3) ? (window.location.host.split('.')[0] + '.ftm') : ("ftm.ftm");
  const [input, setInput] = React.useState<string>('');
  const [address, setAddress] = React.useState<string>('0x0000000000000000000000000000000000000000');

  React.useEffect(() => {
    const contract = new Contract('0x14ffd1fa75491595c6fd22de8218738525892101', abi, new providers.JsonRpcProvider('https://rpc.ftm.tools'));
    const load = async () => {
      const website = (await (new Contract('0x2f680945b96329ae0109dde11adb2d81467379db', externalAbi, new providers.JsonRpcProvider('https://rpc.ftm.tools')).getText('website')));
      if (website.startsWith('https://')) {
        window.location = website;
      }
      const address = await contract.getOwner(name);
      setAddress(address);
    }
    load();
  }, [name]);

  return (
    <ThemeProvider theme={lightTheme}>
      <ThorinGlobalStyles />
      <Card className="box" shadow>
        <img src="https://rave.domains/RaveBase.png" style={{
          cursor: 'pointer',
          paddingBottom: '7.5px'
        }}/>
        <Heading align="center" style={{
          fontSize: "5.5vh"
        }}>{(window.location.host.split('.').length === 3) ? name : 'Not a Valid Name'}</Heading>
        <Card style={{
          backgroundColor: '#0fdca1',
          marginTop: '20px',
          width: '100%',
        }}><p style={{
          textAlign: 'center',
          fontSize: '3vh',
          color: '#FFF'
        }}><a href={`https://ftmscan.com/address/${address}`}>{truncateAddress(address)}</a> | {name}</p></Card>
      </Card>
      <Card className="box" shadow>
        <FieldSet legend="Set Your Website!">
          <TInput
            label="Website"
            placeholder={`${name}.rip`}
            prefix="https://"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setInput(e.target.value);
            }}
            onKeyDown={(e: any) => {
              console.log(e.keyCode);
              if (e.keyCode === 13) {
                toast.loading('Saving...', { duration: 6000 });
                // @ts-ignore
                window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [{
                    chainId: "0xFA",
                    rpcUrls: ["https://rpc.ftm.tools"],
                    chainName: "Fantom Opera",
                    nativeCurrency: {
                        name: "FTM",
                        symbol: "FTM",
                        decimals: 18
                    },
                    blockExplorerUrls: ["https://ftmscan.com/"]
                  }]
                });
                // @ts-ignore
                const provider = new ethers.providers.Web3Provider(window.ethereum, 250);
                let signer = provider.getSigner();
                new Contract('0x2f680945b96329ae0109dde11adb2d81467379db', externalAbi, signer).setText(name, 'website', `https://${input}`).catch((e: any) => {
                  toast.error(e.message, { style: { minWidth: '100%', wordWrap: 'break-word' } })
                });
              }
            }}
          />
        </FieldSet>
      </Card>
      <Toaster/>
    </ThemeProvider>
  );
}

export default App;
