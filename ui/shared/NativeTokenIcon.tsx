import { Image, chakra } from '@chakra-ui/react';
import React from 'react';

import config from 'configs/app';

import TokenLogoPlaceholder from './TokenLogoPlaceholder';

type Props = {
  isLoading?: boolean;
  className?: string;
  type?: 'primary' | 'secondary';
};

const NativeTokenIcon = ({ className }: Props) => {
  const src = '/static/BitcoinIcon.png';
  return (
    <Image
      borderRadius="base"
      className={ className }
      src={ src || '' }
      alt={ `${ config.chain.currency.symbol } logo` }
      fallback={ <TokenLogoPlaceholder borderRadius="base" className={ className }/> }
      fallbackStrategy={ src ? 'onError' : 'beforeLoadOrError' }
    />
  );
};

export default chakra(NativeTokenIcon);
