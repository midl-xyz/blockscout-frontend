import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

import type { SocketMessage } from 'lib/socket/types';
import type { Address } from 'types/api/address';

import config from 'configs/app/chain';
import { getResourceKey } from 'lib/api/useApiQuery';
import useSocketChannel from 'lib/socket/useSocketChannel';
import useSocketMessage from 'lib/socket/useSocketMessage';
import { currencyUnits } from 'lib/units';
import CurrencyValue from 'ui/shared/CurrencyValue';
import * as DetailsInfoItem from 'ui/shared/DetailsInfoItem';
import NativeTokenIcon from 'ui/shared/NativeTokenIcon';

interface Props {
  data: Pick<Address, 'block_number_balance_updated_at' | 'coin_balance' | 'hash' | 'exchange_rate'>;
  isLoading: boolean;
  btcAddress?: string | null;
}

const AddressBalance = ({ data, isLoading, btcAddress }: Props) => {
  const [ lastBlockNumber, setLastBlockNumber ] = React.useState<number>(data.block_number_balance_updated_at || 0);
  const queryClient = useQueryClient();

  const updateData = React.useCallback((balance: string, exchangeRate: string, blockNumber: number) => {
    if (blockNumber < lastBlockNumber) {
      return;
    }

    setLastBlockNumber(blockNumber);
    const queryKey = getResourceKey('address', { pathParams: { hash: data.hash } });
    queryClient.setQueryData(queryKey, (prevData: Address | undefined) => {
      if (!prevData) {
        return;
      }
      return {
        ...prevData,
        coin_balance: balance,
        exchange_rate: exchangeRate,
        block_number_balance_updated_at: blockNumber,
      };
    });
  }, [ data.hash, lastBlockNumber, queryClient ]);

  const handleNewBalanceMessage: SocketMessage.AddressBalance['handler'] = React.useCallback((payload) => {
    updateData(payload.balance, payload.exchange_rate, payload.block_number);
  }, [ updateData ]);

  const handleNewCoinBalanceMessage: SocketMessage.AddressCurrentCoinBalance['handler'] = React.useCallback((payload) => {
    updateData(payload.coin_balance, payload.exchange_rate, payload.block_number);
  }, [ updateData ]);

  const channel = useSocketChannel({
    topic: `addresses:${ data.hash.toLowerCase() }`,
    isDisabled: !data.coin_balance,
  });
  useSocketMessage({
    channel,
    event: 'balance',
    handler: handleNewBalanceMessage,
  });
  useSocketMessage({
    channel,
    event: 'current_coin_balance',
    handler: handleNewCoinBalanceMessage,
  });

  const [ btcBalance, setBtcBalance ] = useState<string | null>(null);

  useEffect(() => {
    const fetchBtcBalance = async() => {
      if (btcAddress) {
        try {
          const response = await fetch(
            `${ config.mempoolUrl }/api/address/${ btcAddress }`,
          );

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: any = await response.json();

          const balanceInBtc =
            (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum);
          setBtcBalance(`${ balanceInBtc.toFixed(8) }`);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch BTC balance:', error);
          setBtcBalance('Error fetching balance');
        }
      }
    };

    fetchBtcBalance();
  }, [ btcAddress ]);

  if (btcBalance) {
    data.coin_balance = btcBalance;
  }

  return (
    <>
      <DetailsInfoItem.Label
        hint={ `${ currencyUnits.ether } balance on BTC network` }
        isLoading={ isLoading }
      >
        Balance
      </DetailsInfoItem.Label>
      <DetailsInfoItem.Value alignSelf="center" flexWrap="nowrap">
        <NativeTokenIcon boxSize={ 6 } mr={ 2 } isLoading={ isLoading }/>
        <CurrencyValue
          value={ data.coin_balance || '0' }
          exchangeRate={ data.exchange_rate }
          decimals={ 8 }
          currency={ currencyUnits.ether }
          accuracyUsd={ 2 }
          accuracy={ 8 }
          flexWrap="wrap"
          isLoading={ isLoading }
        />
      </DetailsInfoItem.Value>
    </>
  );
};

export default React.memo(AddressBalance);
