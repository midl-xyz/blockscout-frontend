import { Box, Flex, Input, InputGroup, InputLeftElement, Link, Text, useColorModeValue } from '@chakra-ui/react';
import _sumBy from 'lodash/sumBy';
import type { ChangeEvent } from 'react';
import React, { useEffect, useState } from 'react';

import type { FormattedData } from './types';
import type { TokenType } from 'types/api/token';

import { getTokenTypeName } from 'lib/token/tokenTypes';
import IconSvg from 'ui/shared/IconSvg';
import LinkInternal from 'ui/shared/links/LinkInternal';
import TruncatedValue from 'ui/shared/TruncatedValue';

import type { Sort } from '../utils/tokenUtils';
import { sortTokenGroups, sortingFns } from '../utils/tokenUtils';
import TokenSelectItem from './TokenSelectItem';

interface RuneToken {
  rune: {
    id: string;
    number: number;
    name: string;
    spaced_name: string;
  };
  balance: string;
  address: string;
}

interface Props {
  btcAddress?: string;
  searchTerm: string;
  erc20sort: Sort;
  erc1155sort: Sort;
  erc404sort: Sort;
  filteredData: FormattedData;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSortClick: (event: React.SyntheticEvent) => void;
}

const TokenSelectMenu = ({
  btcAddress,
  searchTerm,
  erc20sort,
  erc1155sort,
  erc404sort,
  filteredData,
  onInputChange,
  onSortClick,
}: Props) => {
  const [ runeTokens, setRuneTokens ] = useState<Array<RuneToken>>([]);
  const searchIconColor = useColorModeValue('blackAlpha.600', 'whiteAlpha.600');

  const hasFilteredResult = _sumBy(Object.values(filteredData), ({ items }) => items.length) > 0;

  useEffect(() => {
    const fetchRuneBalances = async() => {
      if (!btcAddress) {
        setRuneTokens([]);
        return;
      }
      try {
        const response = await fetch(
          `https://regtest-mempool.midl.xyz/runes/v1/addresses/${ btcAddress }/balances`,
        );
        if (!response.ok) throw new Error('Failed to fetch Rune balances');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = await response.json();
        setRuneTokens(data?.results);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching Rune tokens:', error);
      }
    };

    fetchRuneBalances();
  }, [ btcAddress ]);

  return (
    <>
      <InputGroup size="xs" mb={ 5 }>
        <InputLeftElement>
          <IconSvg name="search" boxSize={ 4 } color={ searchIconColor }/>
        </InputLeftElement>
        <Input
          paddingInlineStart="38px"
          placeholder="Search by token name"
          ml="1px"
          onChange={ onInputChange }
          bgColor="dialog_bg"
        />
      </InputGroup>

      <Flex flexDir="column" alignItems="start" rowGap={ 6 }>
        { /* Render Rune tokens */ }
        { runeTokens.length > 0 && (
          <Box>
            <Text color="gray.500" fontWeight={ 600 } fontSize="sm">
              Runes ({ runeTokens.length })
            </Text>
            { runeTokens.map((token) => (
              <LinkInternal
                key={ token.rune.id }
                px={ 1 }
                py="10px"
                display="flex"
                flexDir="column"

                rowGap={ 2 }
                borderColor="divider"
                borderBottomWidth="1px"
                _hover={{
                  bgColor: 'blue.50',
                }}
                color="unset"
                fontSize="sm"
                href="#"
              >
                <Flex flexDir="column" alignItems="start" w="100%" overflow="hidden"
                  justifyContent="start">
                  <Flex flexDir="row" alignItems="start" w="100%" overflow="hidden"
                    justifyContent="start" gap={ 2 }>
                    <Text fontWeight={ 600 } backgroundColor="gray.200" color="gray.400" borderRadius="200px" px={ 1.5 } py={ 0 } overflowX="hidden">R</Text>
                    <Text fontWeight={ 700 }>{ token.rune.spaced_name }</Text>
                  </Flex>

                  <TruncatedValue
                    value={ token.balance }
                    fontWeight={ 400 }
                  />
                </Flex>
              </LinkInternal>
            )) }
          </Box>
        ) }

        { /* Render EVM tokens */ }
        { Object.entries(filteredData).sort(sortTokenGroups).map(([ tokenType, tokenInfo ]) => {
          if (tokenInfo.items.length === 0) return null;

          const type = tokenType as TokenType;
          const arrowTransform =
            (type === 'ERC-1155' && erc1155sort === 'desc') ||
            (type === 'ERC-404' && erc404sort === 'desc') ||
            (type === 'ERC-20' && erc20sort === 'desc') ?
              'rotate(90deg)' :
              'rotate(-90deg)';
          const sortDirection: Sort = (() => {
            switch (type) {
              case 'ERC-1155':
                return erc1155sort;
              case 'ERC-20':
                return erc20sort;
              default:
                return 'desc';
            }
          })();
          const hasSort =
            (type === 'ERC-404' && tokenInfo.items.some((item) => item.value)) ||
            type === 'ERC-1155' ||
            (type === 'ERC-20' && tokenInfo.items.some(({ usd }) => usd));
          const numPrefix = tokenInfo.isOverflow ? '>' : '';

          return (
            <Box key={ type }>
              <Flex justifyContent="space-between">
                <Text mb={ 3 } color="gray.500" fontWeight={ 600 } fontSize="sm">
                  { getTokenTypeName(type) } tokens ({ numPrefix }
                  { tokenInfo.items.length })
                </Text>
                { hasSort && (
                  <Link
                    data-type={ type }
                    onClick={ onSortClick }
                    aria-label={ `Sort ${ getTokenTypeName(type) } tokens` }
                  >
                    <IconSvg
                      name="arrows/east"
                      boxSize={ 5 }
                      transform={ arrowTransform }
                      transitionDuration="faster"
                    />
                  </Link>
                ) }
              </Flex>
              { tokenInfo.items
                .sort(sortingFns[type](sortDirection))
                .map((data) => (
                  <TokenSelectItem
                    key={ data.token.address + data.token_id }
                    data={ data }
                  />
                )) }
            </Box>
          );
        }) }
      </Flex>
      { Boolean(searchTerm) && !hasFilteredResult && (
        <Text fontSize="sm">Could not find any matches.</Text>
      ) }
    </>
  );
};

export default React.memo(TokenSelectMenu);
