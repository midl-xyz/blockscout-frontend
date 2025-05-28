import type { WalletType, WalletInfo } from 'types/client/wallets';

export const WALLETS_INFO: Record<
  Exclude<WalletType, 'none'>,
  WalletInfo
> = {} as unknown as Record<Exclude<WalletType, 'none'>, WalletInfo>;
