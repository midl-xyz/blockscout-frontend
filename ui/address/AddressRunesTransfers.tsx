/* eslint-disable @next/next/no-img-element */
import {
  Box,
  HStack,
  Hide,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

import useIsMounted from 'lib/hooks/useIsMounted';
import getQueryParamString from 'lib/router/getQueryParamString';
import { useRunesTransactions } from 'ui/address/runes-utils';
import AddressIdenticon from 'ui/shared/entities/address/AddressIdenticon';
import LinkExternal from 'ui/shared/links/LinkExternal';

import Arrow from './assets/SVG.png';

const slicedHash = (hash: string) => hash.slice(0, 6) + '...' + hash.slice(-6);

type Props = {
  btcAddress: string | null | undefined;
  shouldRender: boolean;
};

const AddressRunesTransfers = ({ btcAddress, shouldRender }: Props) => {
  const router = useRouter();
  const isMounted = useIsMounted();

  const currentAddress = getQueryParamString(router.query.hash);

  const {
    transactions: data,
  } = useRunesTransactions(btcAddress);

  if (!isMounted || !shouldRender || data.length === 0) {
    return null;
  }
  return (
    <Hide below="lg" ssr={ false }>
      <Table minW="950px" width="100%">
        <Thead>
          <Tr>
            <Th width="44px"></Th>
            <Th width="440px">Token</Th>
            <Th width="200px">Txn hash</Th>
            <Th width="140px">BTC Block</Th>
            <Th width="60%">From/To</Th>
            <Th width="40%" isNumeric>
              Value
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          { data.map((item, index) => (
            <Tr key={ index }>
              <Td width="44px"></Td>
              <Td width="230px">
                <VStack sx={{ gap: 2, alignItems: 'start' }}>
                  <HStack sx={{ gap: 2 }}>
                    <Text
                      background="gray.200"
                      color="gray.400"
                      borderRadius="400px"
                      fontWeight={ 600 }
                      width="20px"
                      height="20px"
                      textAlign="center"
                    >
                      T
                    </Text>
                    <Text fontSize="sm" fontWeight={ 500 }>
                      { item.spacedRuneName.length > 28 ?
                        item.spacedRuneName.slice(0, 28) + '...' :
                        item.spacedRuneName }
                    </Text>
                  </HStack>

                  <HStack sx={{ paddingX: 1, gap: 3 }}>
                    <Text
                      background="gray.200"
                      color="blackAlpha.800"
                      borderRadius="4px"
                      fontSize="sm"
                      fontWeight={ 500 }
                      padding="2px"
                    >
                      Runes
                    </Text>

                    <Text
                      background="orange.100"
                      color="orange.500"
                      borderRadius="4px"
                      fontSize="sm"
                      fontWeight={ 500 }
                      padding="2px"
                    >
                      Edict
                    </Text>
                  </HStack>
                </VStack>
              </Td>

              <Td width="200px">
                <LinkExternal
                  href={ `https://mempool.regtest.midl.xyz/tx/${ item.txHash }` }
                >
                  { slicedHash(item.txHash) }
                </LinkExternal>
              </Td>
              <Td width="140px">
                <VStack sx={{ gap: 1, alignItems: 'start' }}>
                  <LinkExternal
                    href={ `https://mempool.regtest.midl.xyz/block/${ item.blockNumber }` }
                  >
                    { item.blockNumber }
                  </LinkExternal>

                  <Text fontSize="sm" fontWeight={ 500 } color="gray.500">
                    { item.timeAgo }
                  </Text>
                </VStack>
              </Td>
              <Td colSpan={ 2 }>
                <HStack
                  justifyContent="space-between"
                  sx={{
                    width: '100%!important',
                    padding: 0,
                  }}
                >
                  <HStack width="60%" sx={{ padding: 0 }}>
                    <AddressIdenticon hash={ currentAddress } size={ 20 }/>
                    <LinkExternal
                      href={
                        item.addressFrom === 'MIDL TSS Vault' ?
                          'https://mempool.regtest.midl.xyz/address/bcrt1qsjcsryftgwyh3e0z0mvc6vdjx9pl8cx8006q3j' :
                          `https://mempool.regtest.midl.xyz/address/${ item.addressFrom }`
                      }
                    >
                      { item.addressFrom ===
                        'bcrt1qsjcsryftgwyh3e0z0mvc6vdjx9pl8cx8006q3j' ||
                      item.addressFrom === 'MIDL TSS Vault' ?
                        'MIDL TSS Vault' :
                        slicedHash(item.addressFrom) }
                    </LinkExternal>

                    <Box sx={{ width: '20px', height: '20px' }}>
                      <img
                        src={ Arrow.src }
                        style={{ width: '100%', height: '100%' }}
                        alt="Pointer icon"
                      />
                    </Box>

                    <LinkExternal
                      href={
                        item.addressTo === 'MIDL TSS Vault' ?
                          'https://mempool.regtest.midl.xyz/address/bcrt1qsjcsryftgwyh3e0z0mvc6vdjx9pl8cx8006q3j' :
                          `https://mempool.regtest.midl.xyz/address/${ item.addressTo }`
                      }
                    >
                      { item.addressTo ===
                        'bcrt1qsjcsryftgwyh3e0z0mvc6vdjx9pl8cx8006q3j' ||
                      item.addressTo === 'MIDL TSS Vault' ?
                        'MIDL TSS Vault' :
                        slicedHash(item.addressTo) }
                    </LinkExternal>
                  </HStack>
                  <HStack
                    width="40%"
                    sx={{
                      padding: 0,
                      alignItems: 'end',
                      justifyContent: 'end',
                    }}
                  >
                    <Text variant="secondary" fontSize="sm" fontWeight={ 500 }>
                      { item.amountOfRunes }
                    </Text>
                  </HStack>
                </HStack>
              </Td>
            </Tr>
          )) }
        </Tbody>
      </Table>
    </Hide>
  );
};

export default AddressRunesTransfers;
