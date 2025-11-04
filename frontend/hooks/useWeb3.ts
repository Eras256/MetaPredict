"use client";

import { useWallet, useConnectionStatus } from "@thirdweb-dev/react";
import { useState, useEffect } from "react";

export function useWeb3() {
  const wallet = useWallet();
  const connectionStatus = useConnectionStatus();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(connectionStatus === "connected");
  }, [connectionStatus]);

  return {
    wallet,
    isConnected,
    address: wallet?.getAddress() || null,
    connectionStatus,
  };
}

