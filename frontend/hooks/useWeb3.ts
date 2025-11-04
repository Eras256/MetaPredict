"use client";

import { useActiveAccount, useConnectionStatus } from "thirdweb/react";
import { useState, useEffect } from "react";

export function useWeb3() {
  const account = useActiveAccount();
  const connectionStatus = useConnectionStatus();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(connectionStatus === "connected" && !!account);
  }, [connectionStatus, account]);

  return {
    account,
    isConnected,
    address: account?.address || null,
    connectionStatus,
  };
}

