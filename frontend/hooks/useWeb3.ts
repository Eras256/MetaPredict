"use client";

import { useActiveAccount } from "thirdweb/react";
import { useMemo } from "react";

export function useWeb3() {
  const account = useActiveAccount();

  const connectionStatus = useMemo(() => {
    return account ? "connected" : "disconnected";
  }, [account]);

  const isConnected = useMemo(() => {
    return !!account;
  }, [account]);

  return {
    account,
    isConnected,
    address: account?.address || null,
    connectionStatus,
  };
}

